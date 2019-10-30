/**
 * 로더 이벤트 목록
 */
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
  CREATE_SHEET = 'create-sheet',
  CREATE_SHEET_FAILED = 'create-sheet-failed',
  CREATED_SHEET = 'created-sheet',
  REMOVE_SHEET = 'remove-sheet',
  REMOVE_SHEET_FAILED = 'remove-sheet-failed',
  REMOVED_SHEET = 'removed-sheet'
}

/** @ignore */
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
  error?: any
}

/** @ignore */
export enum LoaderStatus {
  IDLE,
  PENDING,
  WORKING
}
