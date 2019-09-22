import {
  ILoaderRegistry,
  ILoaderRegistryItemUpdateData,
  ILoaderRegistryItem,
  ILoaderRegistryItemData,
  LoaderRegistryDataType,
} from './interface'
import { LoaderRegistryItem } from './item'
import { generateVersion } from './utils'
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
import { EventEmitter } from 'events'

class LoaderRegistry extends EventEmitter implements ILoaderRegistry {
  private _list: ILoaderRegistryItem[]
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
  add(params: LoaderRegistryDataType | LoaderRegistryDataType[]): ILoaderRegistryItem|ILoaderRegistryItem[]|null {
    const self = this
    const res: ILoaderRegistryItem[] = []
    castArray(params).forEach((data: string | ILoaderRegistryItemData) => {
      let item;
      try {
        item = new LoaderRegistryItem(data)
      } catch (err) {
        console.warn(err)
        return
      }
      const { alias, url } = item.jsonData
      if (this.exists(alias)) {
        const tItem = this.get(alias) as LoaderRegistryItem
        if (tItem.url === url) {
          console.warn(`ignore duplicate script "${alias}"`)
          return
        }
        item.version = generateVersion(item)
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
  get(alias: string): ILoaderRegistryItem | null {
    const ndx = this.getIndexByAlias(alias)
    if (ndx < 0) return null
    return this._list[ndx]
  }
  info(alias: string): string {
    let res: any = this.getAll(alias).map(item => item.toString())
    if (res.length === 1) res = res[0]
    return JSON.stringify(res, null, 2)
  }
  getAll(query: string): ILoaderRegistryItem[] {
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
  remove(alias: string) {
    const items = this.getAll(alias)
    if (!items.length) return
    const ids = items.map(item => item.id)
    const result: ILoaderRegistryItem[] = []
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
