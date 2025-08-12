import { documentReady } from '../shared/dom-utils'
import { find, isNil, now, remove } from '../shared/lodash'

import { CustomEventEmitter } from '../custom'
import { RegistryItem } from '../registry'
import { LoaderEventName } from '../interface'
import { IBSheetLoaderStatic } from '../main'

import { LoaderTaskType, TaskManagerOptions } from './interface'
import { getTaskEventsByType, isResolveTaskEvent } from './utils'

/** @ignore */
export class LoaderTaskManager extends CustomEventEmitter {
  private _type: LoaderTaskType
  private _stack: RegistryItem[]
  private _wipList: RegistryItem[]
  private _working: boolean = false
  private _reserved: number = 0
  private _uber: IBSheetLoaderStatic

  constructor(type: LoaderTaskType, uber: IBSheetLoaderStatic) {
    super()
    this._type = type
    this._stack = []
    this._wipList = []
    this._uber = uber
  }

  get working(): boolean {
    return this._working
  }
  get type(): LoaderTaskType {
    return this._type
  }
  get debug(): boolean {
    return this._uber.debug
  }
  get options(): TaskManagerOptions {
    return {
      debug: this.debug,
      retry: this._uber.getOption('retry'),
    }
  }
  get reserved(): boolean {
    return this._reserved > 0
  }
  private _reserveJobs(): void {
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
  private _newWipItem(item?: RegistryItem): RegistryItem | null {
    if (isNil(item)) return null
    // console.log(`%c[WIP]: ${item.alias}`, 'background-color:royalblue;color:white')
    this._wipList.push(item)
    return item
  }
  private _resolveWipItem(item: RegistryItem): RegistryItem {
    remove(this._wipList, (o) => o.id === item.id)
    return item
  }
  private _checkIgnoreItem(item: RegistryItem): boolean {
    return this.type === LoaderTaskType.LOAD ? item.loaded : !item.loaded
  }
  add(item: RegistryItem, immediatly: boolean = false): RegistryItem | null {
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
  exists(item: RegistryItem): boolean {
    let target = find(this._stack, { id: item.id })
    if (isNil(target) && this._wipList.length) {
      target = find(this._wipList, { id: item.id })
    }
    return !isNil(target)
  }
  private _start(): void {
    if (this.working) {
      this._reserveJobs()
      return
    }
    this._working = true
    const startTime = now()
    const asyncTasks = []
    let item: any
    while (this._stack.length) {
      item = this._newWipItem(this._stack.shift())
      if (isNil(item) || this._checkIgnoreItem(item)) continue
      if (this.debug) {
        console.log(`%c[${this.type}.start] ${item.alias}`, 'color:royalblue')
      }
      const eventData = { target: item }
      this.emit(LoaderEventName.LOAD, eventData)
      const eventList = getTaskEventsByType(this.type)
      const task = new Promise((resolve) => {
        eventList.forEach((event) => {
          item.once(event, (evt: any) => {
            this.emit(event, eventData)
            if (isResolveTaskEvent(event)) {
              this._resolveWipItem(evt.target)
              resolve(evt.target)
            }
          })
        })
        const taskHandler = item[this.type]
        taskHandler.call(item, this.options)
      })
      asyncTasks.push(task)
    }
    if (!asyncTasks.length) return
    Promise.all(asyncTasks)
      .then((items) => {
        if (this.debug) {
          console.log(
            `%c[IBSheetLoader] ${this.type} tasks all done -- ${
              now() - startTime
            }ms`,
            'color: green',
          )
        }
        this.emit(LoaderEventName.LOAD_COMPLETE, { target: this, data: items })
        this._working = false
        this._resolveJobs()
      })
      .catch((err: any) => {
        this.emit(LoaderEventName.LOAD_FAILED, { target: this, error: err })
        this._working = false
        throw new Error(err)
      })
  }
  start(): void {
    documentReady(() => this._start())
  }
}
