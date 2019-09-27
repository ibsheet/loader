import { IBSheetOptions } from './options'

export interface IBSheetCreateOptions {
  // global name
  id: string
  // traget element id
  el: string
  // ibsheet options
  options: IBSheetOptions
  data?: any
}

export interface IBSheetGlobalStatic {
  // create: (...args: any[]) => void
  create: (options: IBSheetCreateOptions) => void
}

export interface IBSheetInstance {
  id: string
  length: number
}
