export interface RetryOptions {
  maxCount?: number
  intervalTime?: number
}

/** @ignore */
export interface TaskManagerOptions {
  debug?: boolean
  retry?: RetryOptions
}

/** @ignore */
export enum LoaderTaskType {
  LOAD = 'load',
  UNLOAD = 'unload',
}
