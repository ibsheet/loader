import { IBSheetOptions } from './options'

export interface IBSheetCreateOptions {
  // global name
  id?: string
  // traget element id
  el?: string
  // ibsheet options
  options?: IBSheetOptions
  data?: any
}

export interface IBSheetInstance {
  id: string
  length: number
}
