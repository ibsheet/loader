import { EventEmitter } from 'events'
// import { parse as parseURL } from 'url'
import isUrl from 'is-url'

import {
  get, set, isNil, castArray, isString,
  find, assignIn
} from './shared/lodash'
import {
  documentReady,
  appendJs,
  appendCss,
} from './shared/dom-utils'

// import { double, power } from './number'
import {
  APP_VERSION,
  APP_GLOBAL
} from './constant'
import {
  ILoaderRegistry,
  LoaderRegistryDataType,
  LoaderRegistry,
  ILoaderRegistryItem
} from './registry'
import {
  ISheetLoaderOptions,
  ISheetLoaderStatic,
  ISheetLoaderStatus,
  ISheetLoaderEvent,
} from './interface'

const LOADED_TEST_RETRY_MAX_COUNT = 10
const LOADED_TEST_RETRY_INTERVAL = 200

/**
 * IBSheetLoader Main Class
 */
class IBSheetLoader extends EventEmitter implements ISheetLoaderStatic {
  private _status: ISheetLoaderStatus = ISheetLoaderStatus.PENDING
  private _ready: boolean = false
  private _jobs: ILoaderRegistryItem[]
  private _RETRY_MAX_COUNT: number
  private _RETRY_INTERVAL_TIME: number
  private _debugMode: boolean
  registry: ILoaderRegistry
  constructor(options?: ISheetLoaderOptions) {
    super()
    this._RETRY_MAX_COUNT = get(options, 'retry.maxCount', LOADED_TEST_RETRY_MAX_COUNT)
    this._RETRY_INTERVAL_TIME = get(options, 'retry.intervalTime', LOADED_TEST_RETRY_INTERVAL)
    this._debugMode = get(options, 'debug', false)
    const regOption = get(options, 'registry')
    this.registry = new LoaderRegistry(regOption)
    this._jobs = []
    this._ready = true
    this._status = ISheetLoaderStatus.IDLE

    documentReady(() => {
      this._ready = true
      const readyCallback = get(options, 'ready')
      if (!isNil(readyCallback)) {
        readyCallback.call(this)
      }
    });
    return this
  }
  get debug(): boolean { return this._debugMode }
  get version(): string { return APP_VERSION }
  /**
   * @desc
   * DOMContentLoaded 상태를 반환
   */
  get ready(): boolean {
    return this._ready
  }
  get status(): ISheetLoaderStatus {
    if (this._status === ISheetLoaderStatus.STARTED && this._jobs.length) {
      return ISheetLoaderStatus.LOADING
    }
    return this._status
  }
  private addJob(item: ILoaderRegistryItem, immediatly: boolean = false): void {
    if (this.existsJob(item)) return
    this._jobs.push(item)
    if (immediatly) {
      documentReady(() => this.startJob())
    }
  }
  private startJob(): void {
    if (this.status >= ISheetLoaderStatus.STARTED || !this._jobs.length) {
      return
    }
    this._status = ISheetLoaderStatus.STARTED
    let item: ILoaderRegistryItem
    while (this._jobs.length) {
      item = this._jobs.shift() as ILoaderRegistryItem
      const eventTarget = { target: item }
      this.emit(ISheetLoaderEvent.LOAD, eventTarget)
      const { id, url, target, type } = item.jsonData
      const elData = { id, url, target }
      let isSuccess: boolean = false
      let errMsg = null
      switch (type) {
        case 'css':
          isSuccess = appendCss(elData)
          break
        case 'js':
          isSuccess = appendJs(elData)
          break
        default:
          // nothing
          errMsg = `[${item.alias}] not supported import type: ${type}`
      }
      if (isNil(errMsg) && !isSuccess) {
        errMsg = `[${item.alias}] failed to create element in document`
      }
      if (!isNil(errMsg)) {
        this.emit(ISheetLoaderEvent.LOAD_REJECT, assignIn(eventTarget, { message: errMsg }))
        if (this.debug) {
          console.warn(errMsg)
        }
        continue
      }
      const INTERVAL_TIME = this._RETRY_INTERVAL_TIME

      new Promise((resolve, reject) => {
        let nCount = 1
        const testInterval = setInterval(() => {
          if (nCount > this._RETRY_MAX_COUNT) {
            return reject()
          }
          if (item.test()) {
            clearInterval(testInterval)
            return resolve()
          }
          if (this.debug) {
            console.warn(`"${item.alias}" is delayed (${nCount * INTERVAL_TIME}ms)`,)
          }
          nCount += 1
        }, INTERVAL_TIME)
      }).then(() => {
        this.emit(ISheetLoaderEvent.LOADED, eventTarget)
      }).catch(() => {
        this.emit(ISheetLoaderEvent.LOAD_ERROR, eventTarget)
      })
    }
    this._status = ISheetLoaderStatus.IDLE
  }
  private existsJob(item: ILoaderRegistryItem): boolean {
    const target = find(this._jobs, { id: item.id })
    return !isNil(target)
  }

  // @override
  public emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, assignIn({ type: event }, ...args))
  }

  load(params?: LoaderRegistryDataType|LoaderRegistryDataType[]): ISheetLoaderStatic {
    castArray(params).forEach(data => {
      let item: ILoaderRegistryItem|null
      if (isString(data)) {
        // check localpath or url
        if (data.indexOf('/') >= 0 || isUrl(data)) {
          item = this.registry.add(data) as ILoaderRegistryItem
        }
        // check exists registry
        else {
          item = this.registry.get(data)
        }
      } else {
        item = this.registry.add(data) as ILoaderRegistryItem
      }
      if (isNil(item)) return
      this.addJob(item, true)
    })
    return this
  }
  reload(): ISheetLoaderStatic {
    return this
  }
  unload(): ISheetLoaderStatic {
    return this
  }
  reset(): ISheetLoaderStatic {
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
set(window, APP_GLOBAL, IBSheetLoader)

export default IBSheetLoader
