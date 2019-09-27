import { LoaderRegistryDataType } from '../registry'
import { ITaskManagerOptions } from '../task-man'

export interface ISheetLoaderConfig extends ITaskManagerOptions {
  debug?: boolean
  registry?: LoaderRegistryDataType[]
  ready?: Function
}
