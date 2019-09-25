import {
  LoaderRegistry,
  LoaderRegistryDataType
} from './registry'
import { CustomEventEmitter } from './custom';

export interface ISheetLoaderTestOptions {
  maxCount?: number
  intervalTime?: number
}

export interface ISheetLoaderConfig {
  retry?: ISheetLoaderTestOptions
  debug?: boolean
}

export interface ISheetLoaderOptions extends ISheetLoaderConfig {
  registry?: LoaderRegistryDataType[]
  ready?: Function
  load?: LoaderRegistryDataType | LoaderRegistryDataType[]
}

export enum LoaderEvent {
  LOAD = 'load',
  LOAD_REJECT = 'load-reject',
  LOAD_FAILED = 'load-failed',
  LOADED = 'loaded',
  LOAD_COMPLETE = 'load-complete',
  CREATE = 'create',
  CREATE_FAILED = 'create-failed',
  CREATED = 'created',
  UNLOAD = 'unload',
  UNLOAD_FAILED = 'unload-failed',
  UNLOADED = 'unloaded'
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

export interface ISheetLoaderStatic extends CustomEventEmitter {
  readonly ready: boolean
  readonly status: LoaderStatus

  registry: LoaderRegistry
  // setConfig: (key: string, value: any) => void
  // getConfig: (key: string) => any
  list(): IRegisteredItem[]
  load(
    param?: LoaderRegistryDataType | LoaderRegistryDataType[]
  ): this
  bind(events: string | symbol, listener: (...args: any[]) => void): this
  reload(alias?: string): this
  unload(alias?: string|string[]): this
  reset(): this
  // create
  // get
  // getIndexById
  // getIdByIndex
  // getList
  // removeById
  // removeByIndex
  // removeAll
  version: string
}
