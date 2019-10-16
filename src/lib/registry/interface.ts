import { RegistryItemData } from './item'

export interface RegistryAliasData {
  name: string
  version?: string
}

export interface RegistryIdentifier extends RegistryAliasData {
  alias: string
}

export type RegistryParam = string | RegistryItemData
