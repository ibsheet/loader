import { RegistryItemData } from './item'

/** @ignore */
export interface RegistryAliasData {
  name: string
  version?: string
}

/** @ignore */
export interface RegistryIdentifier extends RegistryAliasData {
  alias: string
}

/** @ignore */
export type RegistryParam = string | RegistryItemData
