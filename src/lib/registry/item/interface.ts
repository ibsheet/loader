import { CustomEventEmitter } from '../../custom'

// export type RegistryItemUrlType = 'css'|'js'
// export type RegistryItemUrlTarget = 'head'|'body'

export interface IRegistryItemUrlData {
  url?: string
  type?: string
  target?: string
}

export interface IRegistryItemURL {
  readonly id: string
  readonly basename: string
  value: string
  type: string
  target: string
}

export interface ILoaderRegistryItemOptions {
  validate?: Function | null
  load?: Function | null
  unload?: Function | null
  dependentUrls?: string[]
}

export interface ILoaderRegistryItemUpdateData extends IRegistryItemUrlData, ILoaderRegistryItemOptions {
  name?: string
  version?: string | null
  urls?: IRegistryItemURL[]
}

export interface ILoaderRegistryItemData extends ILoaderRegistryItemUpdateData {
  urls?: IRegistryItemURL[]
}

export interface ILoaderRegistryItemRawData {
  id: string
  urls: string[]
  name: string
  version: string | null
  alias: string
  loaded: boolean
  error?: any
}

export interface ILoaderRegistryItem extends CustomEventEmitter {
  readonly id: string
  readonly urls: IRegistryItemURL[]
  readonly alias: string
  readonly raw: ILoaderRegistryItemRawData
  readonly hasVersion: boolean
  readonly loaded: boolean
  name: string
  version: string | null
  error: any
  load(options?: any): this
  unload(options?: any): this
  setOption(name: string, value: any): void
  test(): boolean
}
