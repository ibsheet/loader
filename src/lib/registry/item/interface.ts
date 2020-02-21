import { RegistryItemURL } from './url'
// export type RegistryItemUrlType = 'css'|'js'
// export type RegistryItemUrlTarget = 'head'|'body'

/**
 * 레지스트리 아이템 이벤트 목록
 */
export enum RegItemEventName {
  VALIDATE = 'validate',
  LOAD = 'load',
  UNLOAD = 'unload',
  /** @ignore */
  DEPENDENT_URLS = 'dependentUrls'
}

export interface RegItemUrlData {
  url?: string
  type?: string
  target?: string
  urls?: RegistryItemURL[]
  baseUrl?: string
  validate?: () => boolean | null
}

// export interface ValidatorItem {
//   name: string
//   callback: () => boolean
// }

export interface ValidatableItem {
  readonly alias: string
  test: () => boolean
}

/** @ignore */
export interface RegItemEventOptions {
  validate?: () => boolean | null
  load?: Function | null
  unload?: Function | null
  dependentUrls?: string[]
}

/** @ignore */
export interface RegItemUpdateData extends RegItemUrlData, RegItemEventOptions {
  // any others
}

export interface RegistryItemData extends RegItemUpdateData {
  name?: string
  version?: string | null
}

/** @ignore */
export interface RegItemRawData {
  id: string
  urls: string[]
  name: string
  version: string | null
  alias: string
  loaded: boolean
  error?: any
}
