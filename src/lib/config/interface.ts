import { RegistryParam } from '../registry'
import { TaskManagerOptions } from '../task-man'

// 20200402 김의연, 서득원, 이재호 - [#] load 시 ibsheet autoload 인터페이스 추가
export interface LoaderConfigOptions extends TaskManagerOptions {
  debug?: boolean
  registry?: RegistryParam[]
  ready?: () => void
  globals?: {
    ibsheet?: string
  }
  autoload?: boolean
  preset?: object // preset 인터페이스 추가
}
