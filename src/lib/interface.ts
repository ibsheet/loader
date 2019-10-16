export enum LoaderEventName {
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

export interface RegisteredItem {
  alias: string
  loaded: boolean
  error?: any
}

export interface LoaderEvent {
  type: LoaderEventName
  target: any
  data?: any
  message?: string
}

export enum LoaderStatus {
  IDLE,
  PENDING,
  WORKING
}
