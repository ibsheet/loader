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
import {
  LoaderTaskManager,
  createTaskManager,
  LoaderTaskType
} from './task-man'
import { getLoadItems } from './modules'
import {
  IBSheetGlobalInstance as IBSheet,
  IBSheetInstance,
  IBSheetCreateOptions
} from './ibsheet'

// import { double, power } from './number'
import { IBSHEET, APP_VERSION, APP_GLOBAL, IBSHEET_GLOBAL } from './constant'
import { ISheetLoaderConfig, DefaultLoaderConfig } from './config'
import { LoaderRegistry, LoaderRegistryItem } from './registry'
import {
  IBSheetLoaderStatic,
  IRegisteredItem,
  LoaderStatus,
  LoaderEvent
} from './interface'

/**
 * IBSheetLoader Main Class
 */
class IBSheetLoader extends CustomEventEmitter implements IBSheetLoaderStatic {
  private _status: LoaderStatus = LoaderStatus.PENDING
  private _ready: boolean = false
  private _loadTaskMan: LoaderTaskManager
  private _unloadTaskMan: LoaderTaskManager
  private _options: ISheetLoaderConfig

  registry: LoaderRegistry
  constructor() {
    super()
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
  get loadedDefaultLib(): boolean {
    const item = this._getDefaultRegItem(false)
    if (isNil(item)) return false
    return item.loaded
  }

  private _getDefaultRegItem(throwError: boolean = true): LoaderRegistryItem {
    const item = this.registry.findOne(IBSHEET)
    if (throwError && isNil(item)) {
      throw new Error(`not found registration data for ${IBSHEET} library`)
    }
    return item as LoaderRegistryItem
  }

  private _initTasksManagers(): void {
    const createTaskMan = bind(createTaskManager, this)
    this._loadTaskMan = createTaskMan(LoaderTaskType.LOAD, this)
    this._unloadTaskMan = createTaskMan(LoaderTaskType.UNLOAD, this)
  }

  config(options?: ISheetLoaderConfig): this {
    if (!isNil(options)) {
      const loaderOpts = pick(options, ['debug', 'retry'])
      this._options = defaultsDeep(loaderOpts, this._options)
      const regOpts = get(options, 'registry')
      if (!isNil(regOpts)) {
        this.registry.addAll(regOpts, true)
      }
      const readyCallback = get(options, 'ready')
      if (!isNil(readyCallback)) {
        documentReady(() => readyCallback.call(this))
      }
    }
    return this
  }

  getOption(sPath: string, def?: any): any {
    return get(this._options, sPath, def)
  }

  info(alias: string): string {
    return this.registry.info(alias)
  }

  list(): IRegisteredItem[] {
    return this.registry.list().map(alias => {
      const item = this.registry.get(alias) as LoaderRegistryItem
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
      .map((item: LoaderRegistryItem) => {
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

  getSheetGlobalObject(): Promise<any> {
    if (this.loadedDefaultLib) {
      return Promise.resolve(window[IBSHEET_GLOBAL])
    }
    return new Promise((resolve, reject) => {
      try {
        const defItem = this._getDefaultRegItem()
        defItem.once(LoaderEvent.LOADED, () => {
          resolve(window[IBSHEET_GLOBAL])
        })
        this.load()
      } catch (err) {
        reject(err)
      }
    })
  }

  createSheet(options: any): Promise<IBSheetInstance> {
    // id: sheet1Opts.id,
    // el: sheet1Opts.elementId,
    // options: sheet1Opts.config,
    // data: sheet1Opts.data
    const ibsheetOpts: IBSheetCreateOptions = {}
    ;[
      { key: 'id' },
      { key: 'el', alias: ['elementId'] },
      { key: 'options', alias: ['config'] },
      { key: 'data' }
    ].forEach(o => {
      const { key } = o
      concat(key, get(o, 'alias'))
        .filter(Boolean)
        .forEach((prop: string) => {
          if (has(options, prop)) {
            ibsheetOpts[key] = get(options, prop)
          }
        })
    })
    return new Promise(async (resolve, reject) => {
      let sheet: any
      if (this.loadedDefaultLib) {
        try {
          sheet = await IBSheet.create(ibsheetOpts)
          return resolve(sheet)
        } catch (err) {
          return reject(err)
        }
      }
      // if not loaded
      const defItem = this._getDefaultRegItem()
      defItem.once(LoaderEvent.LOADED, async () => {
        try {
          sheet = await IBSheet.create(ibsheetOpts)
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
        item.once(LoaderEvent.UNLOADED, evt => {
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
// const fn = IBSheetLoader.prototype
// fn.double = double
// fn.power = power

const loaderInstance = new IBSheetLoader()

// set global variable
if (!has(window, APP_GLOBAL)) {
  set(window, APP_GLOBAL, loaderInstance)
}

export default loaderInstance
