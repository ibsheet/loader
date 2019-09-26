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
  pick,
  defaultsDeep,
  bind,
  clone,
  isArray
} from './shared/lodash'
import { documentReady } from './shared/dom-utils'
import {
  LoaderTaskManager,
  createTaskManager,
  LoaderTaskType,
} from './task-man'

// import { double, power } from './number'
import {
  APP_VERSION, APP_GLOBAL,
  LOAD_TEST_RETRY_INTERVAL,
  LOAD_TEST_RETRY_MAX_COUNT
} from './constant'
import {
  LoaderRegistryDataType,
  LoaderRegistry,
  LoaderRegistryItem
} from './registry'
import {
  ISheetLoaderConfig,
  IBSheetLoaderStatic,
  IRegisteredItem,
  LoaderStatus
} from './interface'

const DefaultOptions = {
  debug: false,
  retry: {
    maxCount: LOAD_TEST_RETRY_MAX_COUNT,
    intervalTime: LOAD_TEST_RETRY_INTERVAL
  }
}

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
    const opts = clone(DefaultOptions)
    this._options = opts
    this.registry = new LoaderRegistry()
    this._initTasksManagers(opts)
    documentReady(() => {
      this._ready = true
      this._status = LoaderStatus.IDLE
    })
    return this
  }
  get debug(): boolean {
    return this.getOptions('debug', false)
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

  private _getDefaultSheetLib(): LoaderRegistryItem {
    const item = this.registry.findOne('ibsheet')
    if (isNil(item)) {
      throw new Error('undefined ibsheet library')
    }
    return item
  }

  private _initTasksManagers(options?: any): void {
    const createTaskMan = bind(createTaskManager, this)
    this._loadTaskMan = createTaskMan(LoaderTaskType.LOAD, options)
    this._unloadTaskMan = createTaskMan(LoaderTaskType.UNLOAD, options)
  }

  config(options?: ISheetLoaderConfig) {
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
    return this
  }

  getOptions(sPath: string, def?: any): any {
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
  load(
    params?: LoaderRegistryDataType | LoaderRegistryDataType[]
  ): this {
    const registry = this.registry
    const taskMan = this._loadTaskMan

    // prepend default library
    const sheetLib = this._getDefaultSheetLib()
    const { alias: defaultAlias } = sheetLib.raw
    if (!sheetLib.loaded && !taskMan.exists(sheetLib)) {
      if (isNil(params)) {
        params = [defaultAlias]
      } else if (isString(params) && params.indexOf('ibsheet') < 0 || !isArray(params)) {
        params = [defaultAlias, params]
      } else if (!params.filter(t => isString(t) && t.indexOf('ibsheet') >= 0).length) {
        params.unshift(defaultAlias)
      }
    }

    // no action
    if (isNil(params)) {
      return this
    }

    // add load tasks
    const tasks = castArray(params).map(data => {
      let item: LoaderRegistryItem | null
      if (isString(data)) {
        // check localpath or url
        if (data.indexOf('/') >= 0 || isUrl(data)) {
          item = registry.add(data) as LoaderRegistryItem
        }
        // check exists registry
        else {
          item = registry.findOne(data)
        }
      } else {
        item = registry.add(data) as LoaderRegistryItem
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

    // prepend default library
    const sheetLib = this._getDefaultSheetLib()
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
