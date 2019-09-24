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

export interface ILoaderRegistryItemUpdateData extends IRegistryItemUrlData {
  name?: string
  version?: string | null
  urls?: IRegistryItemURL[]
  test?: Function | null
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
  validator?: boolean
  error?: any
}

export interface ILoaderRegistryItem {
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
  setValidator(fn: Function): void
  test(): boolean
}
