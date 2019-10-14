import {
  ILoaderRegistryItemData
} from './item'

export interface ILoaderRegistryAliasData {
  name: string
  version?: string
}

export interface IRegistryIdentifier extends ILoaderRegistryAliasData {
  alias: string
}

export type LoaderRegistryDataType = string | ILoaderRegistryItemData
