import { documentReady } from '../shared/dom-utils'
import {
  get, find, isNil, now,
  pick, remove
} from '../shared/lodash'

import { CustomEventEmitter } from '../custom'
import { LoaderRegistryItem } from '../registry'
import {
  LoaderEvent, ISheetLoaderConfig
} from '../interface'

import { LoaderTaskType } from './interface'
import {
  getTaskEventsByType,
  isResolveTaskEvent
} from './utils'

export class LoaderTaskManager extends CustomEventEmitter {
  private _type: LoaderTaskType
  private _stack: LoaderRegistryItem[]
  private _wipList: LoaderRegistryItem[]
  private _working: boolean = false
  private _reserved: number = 0
  private _options: ISheetLoaderConfig

  constructor(type: LoaderTaskType, uberOptions?: ISheetLoaderConfig) {
    super()
    this._type = type;
    this._stack = []
    this._wipList = []
    this._options = uberOptions || {}
  }

  get working(): boolean { return this._working }
  get type(): LoaderTaskType { return this._type }
  get debug(): boolean { return get(this._options, 'debug', false) }
  get reserved(): boolean { return this._reserved > 0 }
  private reserveJobs(): void {
    this._reserved += 1
  }
  private _resolveJobs(): void {
    // console.log(`%c[TMAN._resolveJobs] ${this._reserved}`, 'background-color:red;color:white')
    if (this.reserved) {
      this._reserved -= 1
      if (this._stack.length) {
        this.start()
      }
    }
  }
  private _newWipItem(item?: LoaderRegistryItem): LoaderRegistryItem|null {
    if (isNil(item)) return null
    // console.log(`%c[WIP]: ${item.alias}`, 'background-color:royalblue;color:white')
    this._wipList.push(item)
    return item
  }
  private _resolveWipItem(item: LoaderRegistryItem): LoaderRegistryItem {
    remove(this._wipList, o => o.id === item.id)
    return item
  }
  private _checkIgnoreItem(item: LoaderRegistryItem): boolean {
    return this.type === LoaderTaskType.LOAD ? item.loaded : !item.loaded
  }
  add(item: LoaderRegistryItem, immediatly: boolean = false): LoaderRegistryItem | null {
    if (this._checkIgnoreItem(item)) {
      if (this.debug) {
        console.warn(`"${item.alias}" is already ${this.type}ed`)
      }
      return null
    }
    if (this.exists(item)) {
      if (this.debug) {
        console.warn(`"${item.alias}" is already added to the tasks`)
      }
      return null
    }
    // console.log(`%c[TMAN.add] ${item.alias}`, 'color:royalblue')
    this._stack.push(item)
    if (immediatly) this.start()
    return item
  }
  exists(item: LoaderRegistryItem): boolean {
    let target = find(this._stack, { id: item.id })
    if (isNil(target) && this._wipList.length) {
      target = find(this._wipList, { id: item.id })
    }
    return !isNil(target)
  }
  private _start(): void {
    if (this.working) {
      this.reserveJobs()
      return
    }
    this._working = true
    const startTime = now()
    const asyncTasks = []
    let item: any
    while(this._stack.length) {
      item = this._newWipItem(this._stack.shift())
      if (isNil(item) || this._checkIgnoreItem(item)) continue
      if (this.debug) {
        console.log(`%c[${this.type}.start] ${item.alias}`, 'color:royalblue')
      }
      const eventData = { target: item }
      this.emit(LoaderEvent.LOAD, eventData)
      const options = pick(this._options, ['debug', 'retry'])
      const eventList = getTaskEventsByType(this.type)
      const task = new Promise(resolve => {
        ;eventList.forEach(event => {
          item.once(event, (evt: any) => {
            this.emit(event, eventData)
            if (isResolveTaskEvent(event)) {
              this._resolveWipItem(evt.target)
              resolve(evt.target)
            }
          })
        })
        const taskHandler = item[this.type]
        taskHandler.call(item, options)
      })
      asyncTasks.push(task)
    }
    if (!asyncTasks.length) return
    Promise.all(asyncTasks)
      .then(items => {
        if (this.debug) {
          console.log(`%c[IBSheetLoader] ${this.type} tasks all done -- ${now() - startTime}ms`, 'color: green')
        }
        this.emit(LoaderEvent.LOAD_COMPLETE, { target: this, data: items })
        this._working = false
        this._resolveJobs()
      })
      .catch((err: any) => {
        this.emit(LoaderEvent.LOAD_FAILED, err)
        this._working = false
      })
  }
  start(): void {
    documentReady(() => this._start())
  }
}
