import { RegistryItemURL } from './url'
// export type RegistryItemUrlType = 'css'|'js'
// export type RegistryItemUrlTarget = 'head'|'body'

export interface RegistryItemUrlData {
  url?: string
  type?: string
  target?: string
  urls?: RegistryItemURL[]
  baseUrl?: string
}

export interface RegistryItemEventOptions {
  validate?: Function | null
  load?: Function | null
  unload?: Function | null
  dependentUrls?: string[]
}

export interface RegistryItemUpdateData
  extends RegistryItemUrlData,
    RegistryItemEventOptions {
  // any others
}

export interface RegistryItemData extends RegistryItemUpdateData {
  name?: string
  version?: string | null
}

export interface RegistryItemRawData {
  id: string
  urls: string[]
  name: string
  version: string | null
  alias: string
  loaded: boolean
  error?: any
}
