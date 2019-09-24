import {
  LoaderRegistry,
  LoaderRegistryDataType
} from './registry'

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
  LOAD_ERROR = 'load-error',
  LOADED = 'loaded',
  LOAD_COMPLETE = 'load-complete',
  CREATE = 'create',
  CREATE_ERROR = 'create-error',
  CREATED = 'created',
  REMOVE = 'remove',
  REMOVE_ERROR = 'remove-error',
  REMOVED = 'removed',
  UNLOAD = 'unload',
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
  STARTED,
  LOADING
}

export interface ISheetLoaderStatic {
  registry: LoaderRegistry
  // setConfig: (key: string, value: any) => void
  // getConfig: (key: string) => any
  list(): IRegisteredItem[]
  load(
    param?: LoaderRegistryDataType | LoaderRegistryDataType[]
  ): this
  readonly ready: boolean
  readonly status: LoaderStatus
  reload(): this
  unload(): this
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
