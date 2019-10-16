import { RegistryParam } from '../registry'
import { TaskManagerOptions } from '../task-man'

export interface ISheetLoaderConfig extends TaskManagerOptions {
  debug?: boolean
  registry?: RegistryParam[]
  ready?: Function
}
