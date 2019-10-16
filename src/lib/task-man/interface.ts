export interface RetryOptions {
  maxCount?: number
  intervalTime?: number
}

export interface TaskManagerOptions {
  debug?: boolean
  retry?: RetryOptions
}

export enum LoaderTaskType {
  LOAD = 'load',
  UNLOAD = 'unload'
}
