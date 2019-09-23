import {
  ILoaderRegistry,
  ILoaderRegistryItem,
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
  CREATE = 'create',
  CREATE_ERROR = 'create-error',
  CREATED = 'created',
  REMOVE = 'remove',
  REMOVE_ERROR = 'remove-error',
  REMOVED = 'removed',
  UNLOAD = 'unload',
  UNLOADED = 'unloaded'
}

export interface ILoaderEvent {
  type: LoaderEvent
  target: ILoaderRegistryItem
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
  registry: ILoaderRegistry
  // setConfig: (key: string, value: any) => void
  // getConfig: (key: string) => any
  load(
    param?: LoaderRegistryDataType | LoaderRegistryDataType[]
  ): ISheetLoaderStatic
  readonly ready: boolean
  readonly status: LoaderStatus
  reload(): ISheetLoaderStatic
  unload(): ISheetLoaderStatic
  reset(): ISheetLoaderStatic
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
