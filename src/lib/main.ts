import { CustomEventEmitter } from './custom'
// import { parse as parseURL } from 'url'

import {
  get,
  set,
  has,
  isNil,
  castArray,
  isString,
  pick,
  defaultsDeep,
  bind,
  concat,
  clone
} from './shared/lodash'
import { documentReady } from './shared/dom-utils'
import { IntervalManager } from './shared/interval-manager'
import { asyncRemoveIBSheetElements } from './registry/item/async-unload'
import {
  LoaderTaskManager,
  createTaskManager,
  LoaderTaskType
} from './task-man'
import { getLoadItems } from './modules'
import {
  IBSheetInstance,
  IBSheetCreateOptions,
  IBSheetGlobalStatic
} from './ibsheet'

// import { double, power } from './number'
import { IBSHEET, APP_VERSION, APP_GLOBAL } from './constant'
import { LoaderConfigOptions, DefaultLoaderConfig } from './config'
import { LoaderRegistry, RegistryItem } from './registry'
import { RegisteredItem, LoaderStatus, LoaderEventName } from './interface'

/**
 * IBSheetLoaderStatic Main Class
 */
export class IBSheetLoaderStatic extends CustomEventEmitter {
  private _status: LoaderStatus = LoaderStatus.PENDING
  private _ready: boolean = false
  private _loadTaskMan: LoaderTaskManager
  private _unloadTaskMan: LoaderTaskManager
  private _options: LoaderConfigOptions
  private _ibsheet: IBSheetGlobalStatic

  intervalMan: IntervalManager
  registry: LoaderRegistry

  constructor() {
    super()
    this._ibsheet = new IBSheetGlobalStatic()
    this._options = clone(DefaultLoaderConfig)
    this.registry = new LoaderRegistry(this)
    this._initTasksManagers()
    documentReady(() => {
      this._ready = true
      this._status = LoaderStatus.IDLE
    })
    return this
  }
  get debug(): boolean {
    return this.getOption('debug', false)
  }
  get version(): string {
    return APP_VERSION
  }
  /**
   * @desc
   * DOMContentLoaded 상태를 반환
   */
  get ready(): boolean {
    return this._ready
  }
  get status(): LoaderStatus {
    return this._status
  }
  get options(): LoaderConfigOptions {
    return clone(this._options)
  }
  get loadedDefaultLib(): boolean {
    const item = this._getDefaultRegItem(false)
    if (isNil(item)) return false
    return item.loaded
  }

  private _getDefaultRegItem(throwError: boolean = true): RegistryItem {
    const item = this.registry.findOne(IBSHEET)
    if (throwError && isNil(item)) {
      throw new Error(`not found registration data for ${IBSHEET} library`)
    }
    return item as RegistryItem
  }

  private _initTasksManagers(): void {
    const createTaskMan = bind(createTaskManager, this)
    this._loadTaskMan = createTaskMan(LoaderTaskType.LOAD, this)
    this._unloadTaskMan = createTaskMan(LoaderTaskType.UNLOAD, this)
  }

  config(options?: LoaderConfigOptions): this {
    let loaderOpts
    if (!isNil(options)) {
      loaderOpts = pick(options, ['debug', 'retry', 'globals'])
      this._options = defaultsDeep(loaderOpts, this._options)
      const sheetGlobal = get(loaderOpts, 'globals.ibsheet')
      this._ibsheet.setGlobalName(sheetGlobal)
      const regOpts = get(options, 'registry')
      if (!isNil(regOpts)) {
        this.registry.addAll(regOpts, true)
      }
      const readyCallback = get(options, 'ready')
      if (!isNil(readyCallback)) {
        documentReady(() => readyCallback.call(this))
      }
    }
    if (this.debug) {
      this.intervalMan = new IntervalManager(window, loaderOpts)
    }

    return this
  }

  getOption(sPath: string, def?: any): any {
    return get(this.options, sPath, def)
  }

  info(alias: string): string | undefined {
    return this.registry.info(alias)
  }

  list(): RegisteredItem[] {
    return this.registry.list().map(alias => {
      const item = this.registry.get(alias) as RegistryItem
      return {
        alias,
        loaded: item.loaded
      }
    })
  }

  load(arg?: any, alsoDefaultLib: boolean = true): this {
    // const registry = this.registry
    const taskMan = this._loadTaskMan
    const aLoadItems = getLoadItems.apply(this, [arg, alsoDefaultLib])

    // add load tasks
    const tasks = aLoadItems
      .map((item: RegistryItem) => {
        if (item.changed) {
          const alias = item.alias
          if (item.loaded) {
            this.reload(alias)
            return
          } else if (taskMan.exists(item)) {
            item.resolveUpdateUrls(() => this.reload(alias))
            return
          }
        }
        return taskMan.add(item)
      })
      .filter(Boolean)

    if (!tasks.length) {
      return this
    }
    // console.log('@@@', tasks.map((o: any) => o.alias))

    // start import library
    taskMan.start()
    return this
  }

  createSheet(options: any): Promise<IBSheetInstance> {
    const ibsheetOpts: IBSheetCreateOptions = {}
    ;[
      { key: 'id' },
      { key: 'el', alias: ['elementId'] },
      { key: 'options', alias: ['config'] },
      { key: 'data' }
    ].forEach((o: any) => {
      const { key } = o
      concat(key, get(o, 'alias'))
        .filter(Boolean)
        .forEach((prop: string) => {
          if (has(options, prop)) {
            ibsheetOpts[key] = get(options, prop)
          }
        })
    })
    const createFn = bind(this._ibsheet.create, this._ibsheet)
    return new Promise(async (resolve, reject) => {
      let sheet: any
      if (this.loadedDefaultLib) {
        try {
          sheet = await createFn(ibsheetOpts)
          return resolve(sheet)
        } catch (err) {
          return reject(err)
        }
      }
      // if not loaded
      const defItem = this._getDefaultRegItem()
      defItem.once(LoaderEventName.LOADED, async () => {
        try {
          sheet = await createFn(ibsheetOpts)
        } catch (err) {
          reject(err)
        }
        return resolve(sheet)
      })
      try {
        this.load()
      } catch (err) {
        reject(err)
      }
    })
  }

  removeSheet(sid: string): void {
    if (!this.loadedDefaultLib) return
    const ibsheet = this._ibsheet.global
    try {
      ibsheet[sid].dispose()
      asyncRemoveIBSheetElements(this.options, true)
    } catch (err) {
      console.error(err)
    }
  }

  sheetReady(callback?: (ibsheet?: any) => void): any {
    if (this.loadedDefaultLib) {
      return Promise.resolve(this._ibsheet.global)
    }
    return new Promise((resolve, reject) => {
      try {
        const defItem = this._getDefaultRegItem()
        defItem.once(LoaderEventName.LOADED, () => {
          const ibsheetStatic = this._ibsheet.global
          try {
            if (!isNil(callback)) {
              callback.call(ibsheetStatic, ibsheetStatic)
            }
            resolve(ibsheetStatic)
          } catch (err) {
            reject(err)
          }
        })
        this.load()
      } catch (err) {
        reject(err)
      }
    }).catch(err => {
      throw new Error(err)
    })
  }

  reload(arg?: string | string[]): this {
    const self = this
    if (isNil(arg)) {
      const item = this._getDefaultRegItem(false)
      if (isNil(item)) return this
      arg = item.alias
    }
    castArray(arg).forEach(alias => {
      const item = this.registry.findOne(alias)
      if (isNil(item)) {
        if (this.debug) {
          console.warn(`not found item: ${alias}`)
        }
        return
      }
      if (item.loaded) {
        item.once(LoaderEventName.UNLOADED, evt => {
          const target = evt.target
          const tAlias = target.alias
          if (this.debug) {
            console.log(
              `%c[IBSheetLoader] reload start - ${tAlias}`,
              'background-color:green;color:white'
            )
          }
          self.load(tAlias, false)
        })
        this.unload(alias)
        return
      }
      this.load(alias, false)
    })
    return this
  }

  unload(params?: string | string[]): this {
    const registry = this.registry
    const taskMan = this._unloadTaskMan

    // unload default library
    const sheetLib = this._getDefaultRegItem()
    const { alias: defaultAlias } = sheetLib.raw
    if (sheetLib.loaded && !taskMan.exists(sheetLib) && isNil(params)) {
      params = [defaultAlias]
    }

    // no action
    if (isNil(params)) {
      return this
    }

    // add load tasks
    const tasks = castArray(params)
      .map(data => {
        let item: any
        if (isString(data)) {
          item = registry.get(data)
        }
        // todo: support json type
        if (isNil(item)) {
          console.warn(`invalid paramater: ${data}`)
          return
        }

        if (!item.loaded) {
          if (this.debug) {
            console.warn(`already unloaded library: ${item.alias}`)
          }
          return
        }

        return taskMan.add(item)
      })
      .filter(Boolean)

    if (!tasks.length) {
      return this
    }
    // console.log('@@@ unload', tasks.map((o: any) => o.alias))

    // start remove library
    taskMan.start()
    return this
  }

  reset(): this {
    return this
  }
  // abstract test prototype
  // double: (value: number) => number
  // power: (base: number, exponent: number) => number
}

/**
 * test prototype
 * @hidden
 */
// const fn = IBSheetLoaderStatic.prototype
// fn.double = double
// fn.power = power

export const IBSheetLoader = new IBSheetLoaderStatic()

// set global variable
if (!has(window, APP_GLOBAL)) {
  set(window, APP_GLOBAL, IBSheetLoader)
}

export default IBSheetLoader
