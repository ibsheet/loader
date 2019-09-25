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
  isArray
} from './shared/lodash'
import { documentReady } from './shared/dom-utils'
import { LoaderTaskManager } from './task-man'

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
  ISheetLoaderOptions,
  ISheetLoaderConfig,
  ISheetLoaderStatic,
  IRegisteredItem,
  LoaderStatus,
  LoaderEvent
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
class IBSheetLoader extends CustomEventEmitter implements ISheetLoaderStatic {
  private _status: LoaderStatus = LoaderStatus.PENDING
  private _ready: boolean = false
  private _loadTaskMan: LoaderTaskManager
  // private _unloadTaskMan: LoaderTaskManager
  private _options: ISheetLoaderConfig
  registry: LoaderRegistry
  constructor(options?: ISheetLoaderOptions) {
    super()
    const loaderOpts = defaultsDeep(
      pick(options, ['debug', 'retry']),
      DefaultOptions
    )
    this._options = loaderOpts
    const regOpts = get(options, 'registry')
    this.registry = new LoaderRegistry(regOpts)
    this._initLoadTaskMan(loaderOpts)
    // this._unloadTaskMan = new LoaderTaskManager('unload', loaderOpts)
    this._ready = true
    this._status = LoaderStatus.IDLE

    documentReady(() => {
      this._ready = true
      const readyCallback = get(options, 'ready')
      this._status = LoaderStatus.IDLE
      if (!isNil(readyCallback)) readyCallback.call(this)
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
    const items = this.registry.getAll('ibsheet')
    if (!items.length) {
      throw new Error('undefined ibsheet library')
    }
    return items[0]
  }
  private _initLoadTaskMan(options?: any): void {
    const taskMan = new LoaderTaskManager('load', options)
    ;[
      LoaderEvent.LOAD,
      LoaderEvent.LOADED,
      LoaderEvent.LOAD_REJECT,
      LoaderEvent.LOAD_FAILED,
      LoaderEvent.LOAD_COMPLETE
    ].forEach(event => {
      taskMan.on(event, evt => this.emit(event, evt))
    })
    this._loadTaskMan = taskMan
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
          item = registry.get(data)
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
  reload(_alias?: string): this {
    console.log('reload:', _alias)
    return this
  }
  unload(params?: string | string[]): this {
    const sheetLib = this._getDefaultSheetLib()
    const { alias: defaultAlias } = sheetLib.raw
    if (isNil(params)) {
      if (!sheetLib.loaded) return this
      params = [defaultAlias]
    }

    if (isNil(params)) return this
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

// set global variable
if (!has(window, APP_GLOBAL)) {
  set(window, APP_GLOBAL, IBSheetLoader)
}

export default IBSheetLoader
