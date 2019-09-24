import {
  findIndex,
  keys,
  has,
  set,
  isNil,
  castArray,
  remove,
  includes,
  lastIndexOf
} from '../shared/lodash'
import {
  IBSHEET,
  IBSHEET_GLOBAL
} from '../constant'
import { ILoaderRegistry, LoaderRegistryDataType } from './interface'
import {
  ILoaderRegistryItemUpdateData,
  ILoaderRegistryItemData,
  LoaderRegistryItem
} from './item'
import { generateVersion } from './utils'

import { EventEmitter } from 'events'

class LoaderRegistry extends EventEmitter implements ILoaderRegistry {
  private _list: LoaderRegistryItem[]
  constructor(params?: LoaderRegistryDataType | LoaderRegistryDataType[]) {
    super()
    const self = this
    this._list = []
    if (!isNil(params)) {
      self.add(params)
    }
    return this
  }
  get length(): number {
    return this._list.length
  }
  add(
    params: LoaderRegistryDataType | LoaderRegistryDataType[]
  ): LoaderRegistryItem | LoaderRegistryItem[] | null {
    const self = this
    const res: LoaderRegistryItem[] = []
    castArray(params).forEach((data: string | ILoaderRegistryItemData) => {
      let item
      try {
        item = new LoaderRegistryItem(data)
      } catch (err) {
        console.warn(err)
        return
      }

      const { alias, urls } = item.raw
      if (this.exists(alias)) {
        const tItem = this.get(alias) as LoaderRegistryItem
        if (tItem.raw.urls[0] === urls[0]) {
          console.warn(`ignore duplicate script "${alias}"`)
          return
        }
        item.version = generateVersion(item)
      }
      // IBSheet Default Validator
      if (item.name === IBSHEET && !has(data, 'validate')) {
        item.setValidator(() => {
          return window[IBSHEET_GLOBAL] != null
        })
      }
      res.push(item)
      self._list.push(item)
    })
    if (!res.length) return null
    if (res.length === 1) return res[0]
    return res
  }
  exists(alias: string): boolean {
    return !isNil(this.get(alias))
  }
  get(alias: string): LoaderRegistryItem | null {
    const ndx = this.getIndexByAlias(alias)
    if (ndx < 0) return null
    return this._list[ndx]
  }
  info(alias: string): string {
    let res: any = this.getAll(alias).map(item => item.raw)
    if (res.length === 1) res = res[0]
    return JSON.stringify(res, null, 2)
  }
  getAll(query: string): LoaderRegistryItem[] {
    const hasVersion = lastIndexOf(query, '@') > 0
    return this._list.filter(item => {
      if (hasVersion) {
        return item.alias === query
      }
      return item.name === query
    })
  }
  getIndexByAlias(alias: string): number {
    return findIndex(this._list, { alias })
  }
  update(alias: string, data: ILoaderRegistryItemUpdateData) {
    const item = this.get(alias)
    if (isNil(item)) return
    keys(data).forEach(key => {
      if (has(item, key)) {
        set(item, key, data[key])
      }
    })
  }
  remove(alias: string): void | LoaderRegistryItem | LoaderRegistryItem[] {
    const items = this.getAll(alias)
    if (!items.length) return
    const ids = items.map(item => item.id)
    const result: LoaderRegistryItem[] = []
    remove(this._list, item => {
      const match = includes(ids, item.id)
      if (match) result.push(item)
      return match
    })
    if (result.length === 1) return result[0]
    return result
  }
  list(): string[] {
    return this._list.map(item => item.alias)
  }
}

export { LoaderRegistry }
export default LoaderRegistry
