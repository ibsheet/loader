import { EventEmitter } from 'events'
// import { parse as parseURL } from 'url'
import isUrl from 'is-url'

import {
  get,
  set,
  isNil,
  castArray,
  isString,
  find,
  assignIn,
  pick,
  now,
  defaultsDeep
} from './shared/lodash'
import { documentReady } from './shared/dom-utils'

// import { double, power } from './number'
import { APP_VERSION, APP_GLOBAL } from './constant'
import {
  ILoaderRegistry,
  LoaderRegistryDataType,
  LoaderRegistry,
  LoaderRegistryItem
} from './registry'
import {
  ISheetLoaderOptions,
  ISheetLoaderConfig,
  ISheetLoaderStatic,
  LoaderStatus,
  LoaderEvent
} from './interface'

const LOADED_TEST_RETRY_MAX_COUNT = 10
const LOADED_TEST_RETRY_INTERVAL = 200
const DefaultOptions = {
  debug: false,
  retry: {
    maxCount: LOADED_TEST_RETRY_MAX_COUNT,
    intervalTime: LOADED_TEST_RETRY_INTERVAL
  }
}

/**
 * IBSheetLoader Main Class
 */
class IBSheetLoader extends EventEmitter implements ISheetLoaderStatic {
  private _status: LoaderStatus = LoaderStatus.PENDING
  private _ready: boolean = false
  private _jobs: LoaderRegistryItem[]
  private _options: ISheetLoaderConfig
  registry: ILoaderRegistry
  constructor(options?: ISheetLoaderOptions) {
    super()
    this._options = defaultsDeep(
      pick(options, ['debug', 'retry']),
      DefaultOptions
    )
    const regOption = get(options, 'registry')
    this.registry = new LoaderRegistry(regOption)
    this._jobs = []
    this._ready = true
    this._status = LoaderStatus.IDLE

    documentReady(() => {
      this._ready = true
      const readyCallback = get(options, 'ready')
      if (!isNil(readyCallback)) {
        readyCallback.call(this)
      }
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
  get ready(): boolean {
    return this._ready
  }
  get status(): LoaderStatus {
    if (this._status === LoaderStatus.STARTED && this._jobs.length) {
      return LoaderStatus.LOADING
    }
    return this._status
  }
  private addJob(item: LoaderRegistryItem, immediatly: boolean = false): void {
    if (this.existsJob(item)) return
    this._jobs.push(item)
    if (immediatly) {
      documentReady(() => this.startLoadJobs())
    }
  }
  private startLoadJobs(): void {
    this._status = LoaderStatus.STARTED
    const startTime = now()
    const tasks = this._jobs.map(item => {
      const eventTarget = { target: item }
      const options = pick(this._options, ['debug', 'retry'])
      return new Promise(resolve => {
        ;[
          LoaderEvent.LOADED,
          LoaderEvent.LOAD_REJECT,
          LoaderEvent.LOAD_ERROR
        ].forEach(event => {
          item.once(event, () => {
            let success = false
            switch (event) {
              case LoaderEvent.LOADED:
                success = true
                // const target = evt.target
                // console.log(`${target.alias} loaded: ${target.loaded}`)
                break
            }
            this.emit(event, eventTarget)
            resolve({ item, success })
          })
        })
        item.load(options)
      })
    })
    Promise.all(tasks)
      .then(() => {
        // res
        if (this.debug) {
          console.log(`[IBSheetLoader] all done - ${now() - startTime}ms`)
        }
        this._status = LoaderStatus.IDLE
      })
      .catch(() => {
        // err
        // nothing error
        this._status = LoaderStatus.IDLE
      })
  }
  private existsJob(item: LoaderRegistryItem): boolean {
    const target = find(this._jobs, { id: item.id })
    return !isNil(target)
  }

  // @override
  public emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, assignIn({ type: event }, ...args))
  }
  getOptions(sPath: string, def?: any): any {
    return get(this._options, sPath, def)
  }
  load(
    params?: LoaderRegistryDataType | LoaderRegistryDataType[]
  ): ISheetLoaderStatic {
    if (!isNil(params)) {
      castArray(params).forEach(data => {
        let item: LoaderRegistryItem | null
        if (isString(data)) {
          // check localpath or url
          if (data.indexOf('/') >= 0 || isUrl(data)) {
            item = this.registry.add(data) as LoaderRegistryItem
          }
          // check exists registry
          else {
            item = this.registry.get(data)
          }
        } else {
          item = this.registry.add(data) as LoaderRegistryItem
        }
        if (isNil(item)) return
        this.addJob(item)
      })
    }
    documentReady(() => this.startLoadJobs())
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
