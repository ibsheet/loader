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
  defaultsDeep,
  isArray
} from './shared/lodash'
import { documentReady } from './shared/dom-utils'

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
class IBSheetLoader extends EventEmitter implements ISheetLoaderStatic {
  private _status: LoaderStatus = LoaderStatus.PENDING
  private _ready: boolean = false
  private _tasks: LoaderRegistryItem[]
  private _options: ISheetLoaderConfig
  private _reserved: boolean
  registry: LoaderRegistry
  constructor(options?: ISheetLoaderOptions) {
    super()
    this._options = defaultsDeep(
      pick(options, ['debug', 'retry']),
      DefaultOptions
    )
    const regOption = get(options, 'registry')
    this.registry = new LoaderRegistry(regOption)
    this._tasks = []
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
  get ready(): boolean {
    return this._ready
  }
  get status(): LoaderStatus {
    if (this._status === LoaderStatus.STARTED && this._tasks.length) {
      return LoaderStatus.LOADING
    }
    return this._status
  }
  private _addTask(item: LoaderRegistryItem, immediatly: boolean = false): void {
    if (this._existsTask(item)) {
      if (this.debug) {
        console.warn(`"${item.alias}" is already added to the tasks`)
      }
      return
    }
    this._tasks.push(item)
    if (immediatly) {
      documentReady(() => this._startTasks())
    }
  }
  private _startTasks(): void {
    if (this.status > LoaderStatus.STARTED) {
      this._reserved = true
      return
    }
    this._status = LoaderStatus.STARTED
    const startTime = now()
    const asyncTasks = []
    let item: any
    while(this._tasks.length) {
      item = this._tasks.shift()
      if (item.loaded) continue
      const eventData = { target: item }
      this.emit(LoaderEvent.LOAD, eventData)
      const options = pick(this._options, ['debug', 'retry'])
      asyncTasks.push(new Promise(resolve => {
        ;[
          LoaderEvent.LOAD,
          LoaderEvent.LOADED,
          LoaderEvent.LOAD_REJECT,
          LoaderEvent.LOAD_ERROR
        ].forEach(event => {
          item.once(event, () => {
            this.emit(event, eventData)
            if (event !== LoaderEvent.LOAD) {
              resolve(item)
            }
          })
        })
        item.load(options)
      }))
    }
    if (!asyncTasks.length) return
    Promise.all(asyncTasks)
      .then(items => {
        if (this.debug) {
          console.log(`%c[IBSheetLoader] all done -- ${now() - startTime}ms`, 'color: green')
        }
        this.emit(LoaderEvent.LOAD_COMPLETE, { target: this, data: items })
        this._status = LoaderStatus.IDLE
        if (this._reserved && this._tasks.length) {
          this._reserved = false
          this._startTasks()
        }
      })
      .catch((err: any) => {
        this.emit(LoaderEvent.LOAD_ERROR, err)
        this._status = LoaderStatus.IDLE
      })
  }
  private _existsTask(item: LoaderRegistryItem): boolean {
    const target = find(this._tasks, { id: item.id })
    return !isNil(target)
  }
  private _defaultLibItem(): LoaderRegistryItem {
    const items = this.registry.getAll('ibsheet')
    if (!items.length) {
      throw new Error('undefined ibsheet library')
    }
    return items[0]
  }

  // @override
  public emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, assignIn({ type: event }, ...args))
  }
  bind(events: string | symbol, listener: (...args: any[]) => void): this {
    if (isString(events) && events.indexOf(' ') > 0) {
      events.split(' ').forEach(event => {
        this.on(event, listener)
      })
      return this
    }
    return this.on(events, listener)
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
    // prepend default library
    const defaultLib = this._defaultLibItem()
    const { alias: defaultAlias } = defaultLib.raw
    if (!this._existsTask(defaultLib) && !defaultLib.loaded) {
      if (isNil(params)) {
        params = [defaultAlias]
      } else if (isString(params) && params.indexOf('ibsheet') < 0 || !isArray(params)) {
        params = [defaultAlias, params]
      } else if (!params.filter(t => isString(t) && t.indexOf('ibsheet') >= 0).length) {
        params.unshift(defaultAlias)
      }
    }
    if (isNil(params)) return this
    // add load jobs
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
      this._addTask(item)
    })
    // start loading
    documentReady(() => this._startTasks())
    return this
  }
  reload(_alias?: string): this {
    console.log('reload:', _alias)
    return this
  }
  unload(_alias?: string): this {
    console.log('unload:', _alias)
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
set(window, APP_GLOBAL, IBSheetLoader)

export default IBSheetLoader
