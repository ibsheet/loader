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
  REMOVED_SHEET = 'removed-sheet',
  CREATE_CHART = 'create-chart',
  CREATE_CHART_FAILED = 'create-chart-failed',
  CREATED_CHART = 'created-chart',
  REMOVE_CHART = 'remove-chart',
  REMOVE_CHART_FAILED = 'remove-chart-failed',
  REMOVED_CHART = 'removed-chart',
  CREATE_MAP = 'create-map',
  CREATE_MAP_FAILED = 'create-map-failed',
  CREATED_MAP = 'created-map',
  REMOVE_MAP = 'remove-map',
  REMOVE_MAP_FAILED = 'remove-map-failed',
  REMOVED_MAP = 'removed-map',
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
  WORKING,
}
