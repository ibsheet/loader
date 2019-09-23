import {
  ILoaderRegistryItemData,
  LoaderRegistryItem,
  ILoaderRegistryItemUpdateData
} from './item'

export interface ILoaderRegistryAliasData {
  name: string
  version?: string
}

export type LoaderRegistryDataType = string | ILoaderRegistryItemData

export interface ILoaderRegistry {
  add(
    params: LoaderRegistryDataType | LoaderRegistryDataType[]
  ): LoaderRegistryItem | LoaderRegistryItem[] | null
  remove(alias: string): void | LoaderRegistryItem | LoaderRegistryItem[]
  list(): string[]
  readonly length: number
  get(alias: string): LoaderRegistryItem | null
  exists(alias: string): boolean
  info(alias: string): string
  getAll(alias: string): LoaderRegistryItem[] | []
  getIndexByAlias(alias: string): number
  update(alias: string, data: ILoaderRegistryItemUpdateData): void
}
