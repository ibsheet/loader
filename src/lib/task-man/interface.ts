export interface ILoaderRetryOptions {
  maxCount?: number
  intervalTime?: number
}

export interface ITaskManagerOptions {
  debug?: boolean
  retry?: ILoaderRetryOptions
}

export enum LoaderTaskType {
  LOAD = 'load',
  UNLOAD = 'unload'
}
