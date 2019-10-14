import { RegistryItemURL } from './url'
// export type RegistryItemUrlType = 'css'|'js'
// export type RegistryItemUrlTarget = 'head'|'body'

export interface IRegistryItemUrlData {
  url?: string
  type?: string
  target?: string
  urls?: RegistryItemURL[]
  baseUrl?: string
}

export interface IRegistryItemEventOptions {
  validate?: Function | null
  load?: Function | null
  unload?: Function | null
  dependentUrls?: string[]
}

export interface ILoaderRegistryItemUpdateData
  extends IRegistryItemUrlData,
    IRegistryItemEventOptions {
  // any others
}

export interface ILoaderRegistryItemData extends ILoaderRegistryItemUpdateData {
  name?: string
  version?: string | null
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
