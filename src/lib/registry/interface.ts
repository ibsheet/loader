import {
  ILoaderRegistryItemData,
  LoaderRegistryItem,
  ILoaderRegistryItemUpdateData
} from './item'

import { CustomEventEmitter } from '../custom'

export interface ILoaderRegistryAliasData {
  name: string
  version?: string
}

export interface IRegistryIdentifier extends ILoaderRegistryAliasData {
  alias: string
}

export type LoaderRegistryDataType = string | ILoaderRegistryItemData

export interface ILoaderRegistry extends CustomEventEmitter {
  add(param: string | ILoaderRegistryItemData): LoaderRegistryItem | undefined
  addAll(
    params: LoaderRegistryDataType | LoaderRegistryDataType[]
  ): LoaderRegistryItem[]
  remove(alias: string): undefined | LoaderRegistryItem | LoaderRegistryItem[]
  list(): string[]
  readonly length: number
  get(alias: string): LoaderRegistryItem | null
  exists(alias: string): boolean
  info(alias: string): string
  // todo: 20190930-angualr tslint error
  // getAll(alias: string): LoaderRegistryItem[] | []
  findOne(alias: string): LoaderRegistryItem | undefined
  findLoadedOne(alias: string): LoaderRegistryItem | undefined
  getIndexByAlias(alias: string): number
  update(alias: string, data: ILoaderRegistryItemUpdateData): void
}
