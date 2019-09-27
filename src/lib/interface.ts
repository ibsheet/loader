import { LoaderRegistry } from './registry'
import { ISheetLoaderConfig } from './config'
import { CustomEventEmitter } from './custom'

export enum LoaderEvent {
  LOAD = 'load',
  LOAD_REJECT = 'load-reject',
  LOAD_FAILED = 'load-failed',
  LOADED = 'loaded',
  LOAD_COMPLETE = 'load-complete',
  UNLOAD = 'unload',
  UNLOAD_REJECT = 'unload-reject',
  UNLOAD_FAILED = 'unload-failed',
  UNLOADED = 'unloaded',
  UNLOAD_COMPLETE = 'unload-complete',
  CREATE = 'create',
  CREATE_FAILED = 'create-failed',
  CREATED = 'created'
}

export interface IRegisteredItem {
  alias: string
  loaded: boolean
  error?: any
}
export interface ILoaderEvent {
  type: LoaderEvent
  target: any
  data?: any
  message?: string
}

export enum LoaderStatus {
  IDLE,
  PENDING,
  WORKING
}

export interface IBSheetLoaderStatic extends CustomEventEmitter {
  readonly ready: boolean
  readonly debug: boolean
  readonly status: LoaderStatus
  registry: LoaderRegistry
  config(options: ISheetLoaderConfig): this
  getOption(name: string): any
  list(): IRegisteredItem[]
  load(args?: any, alsoDefault?: boolean): this
  createSheet(options: any): any
  reload(alias?: string): this
  unload(alias?: string | string[]): this
  reset(): this
  version: string
}
