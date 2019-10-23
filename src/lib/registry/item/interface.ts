import { RegistryItemURL } from './url'
// export type RegistryItemUrlType = 'css'|'js'
// export type RegistryItemUrlTarget = 'head'|'body'

export enum RegItemEventName {
  VALIDATE = 'validate',
  LOAD = 'load',
  UNLOAD = 'unload',
  DEPENDENT_URLS = 'dependentUrls'
}

export interface RegItemUrlData {
  url?: string
  type?: string
  target?: string
  urls?: RegistryItemURL[]
  baseUrl?: string
}

export interface RegItemEventOptions {
  validate?: Function | null
  load?: Function | null
  unload?: Function | null
  dependentUrls?: string[]
}

export interface RegItemUpdateData extends RegItemUrlData, RegItemEventOptions {
  // any others
}

export interface RegistryItemData extends RegItemUpdateData {
  name?: string
  version?: string | null
}

export interface RegItemRawData {
  id: string
  urls: string[]
  name: string
  version: string | null
  alias: string
  loaded: boolean
  error?: any
}
