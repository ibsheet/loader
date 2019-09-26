import { CustomEventEmitter } from './custom'
// import { parse as parseURL } from 'url'
import isUrl from 'is-url'

import {
  get,
  set,
  has,
  isNil,
  castArray,
  isString,
  isObject,
  isArray,
  pick,
  defaultsDeep,
  bind,
  clone,
  concat,
} from './shared/lodash'
import { documentReady } from './shared/dom-utils'
import {
  LoaderTaskManager,
  createTaskManager,
  LoaderTaskType,
} from './task-man'

// import { double, power } from './number'
import {
  IBSHEET,
  APP_VERSION, APP_GLOBAL,
} from './constant'
import {
  ISheetLoaderConfig,
  DefaultLoaderConfig
} from './config'
import {
  LoaderRegistry,
  LoaderRegistryItem
} from './registry'
import {

  IBSheetLoaderStatic,
  IRegisteredItem,
  LoaderStatus
} from './interface'
import {
  validSheetRegistData
} from './ibsheet'

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
    this.registry = new LoaderRegistry()
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
  get ready(): boolean { return this._ready }
  get status(): LoaderStatus { return this._status }
  get loadedSheetLib(): boolean {
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
        this.registry.add(regOpts, true)
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
  info(alias: string): string { return this.registry.info(alias) }
  list(): IRegisteredItem[] {
    return this.registry.list().map(alias => {
      const item = this.registry.get(alias) as LoaderRegistryItem
      return {
        alias,
        loaded: item.loaded
      }
    })
  }
  load(args?: any): this {
    const registry = this.registry
    const taskMan = this._loadTaskMan
    const needDefaultLoadTask = !this.loadedSheetLib
    const noArgs = isNil(args)

    let needDefaultItem = false
    // define default library
    if (needDefaultLoadTask) {
      if (noArgs) {
        needDefaultItem = true
      } else if (isString(args) || isObject(args)) {
        needDefaultItem = !validSheetRegistData(args)
      } else if (isArray(args)) {
        const arr = args.filter((t: any) => validSheetRegistData(t))
        needDefaultItem = !arr.length
      }
    }

    if (needDefaultItem) {
      const defItem = this._getDefaultRegItem()
      const { alias } = defItem.raw
      args = noArgs ? [alias] : concat(alias, args)
    }

    // no action
    if (isNil(args)) return this

    // add load tasks
    const tasks = castArray(args).map(data => {
      let item: any
      if (isString(data)) {
        // check localpath or url
        if (data.indexOf('/') >= 0 || isUrl(data)) {
          item = registry.add(data)
        }
        // check exists registry
        else {
          item = registry.findOne(data)
        }
      } else {
        item = registry.add(data)
      }

      if (isNil(item)) {
        console.warn(`invalid paramater: ${data}`)
        return
      }

      if (item.loaded) {
        if (this.debug) {
          console.warn(`already loaded library: ${item.alias}`)
        }
        return
      }

      // mute debug log for default library
      if (item.alias === IBSHEET && taskMan.exists(item)) {
        return
      }

      return taskMan.add(item)
    }).filter(Boolean)

    if (!tasks.length) {
      return this
    }
    // console.log('@@@', tasks.map((o: any) => o.alias))

    // start import library
    taskMan.start()
    return this
  }

  createSheet(_options?: any): any {
    return
  }

  reload(_alias?: string): this {
    console.log('reload:', _alias)
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
    const tasks = castArray(params).map(data => {
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
    }).filter(Boolean)

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
