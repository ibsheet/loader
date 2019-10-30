import {
  findIndex,
  isNil,
  castArray,
  remove,
  includes,
  lastIndexOf
} from '../shared/lodash'
import { IBSheetLoaderStatic } from '../main'
import { CustomEventEmitter } from '../custom'
import { isIBSheet } from '../ibsheet'
import { RegistryParam } from './interface'
import { RegItemUpdateData, RegistryItemData, RegistryItem } from './item'
import { generateVersion } from './utils'
import { defaultsIBSheetEvents } from './for-ibsheet'

class LoaderRegistry extends CustomEventEmitter {
  /** @ignore */
  private _list: RegistryItem[]
  /** @ignore */
  private _uber: IBSheetLoaderStatic
  /** @ignore */
  constructor(uber: IBSheetLoaderStatic) {
    super()
    this._list = []
    this._uber = uber
    return this
  }
  /** @ignore */
  get debug(): boolean {
    return this._uber.debug
  }
  get length(): number {
    return this._list.length
  }
  protected getUberOption(sPath: string, def: any) {
    return this._uber.getOption(sPath, def)
  }

  add(
    data: string | RegistryItemData,
    overwrite: boolean = false
  ): RegistryItem | undefined {
    let item
    try {
      item = new RegistryItem(data)
    } catch (err) {
      console.warn(err)
      return
    }

    const { alias, urls } = item.raw
    const bIBSheet = isIBSheet(item.name)
    const existItem = this.get(alias)
    if (!isNil(existItem)) {
      if (overwrite) {
        if (this.debug) {
          console.log(
            `%c[registry.add] update "${alias}":`,
            'color: royalblue',
            data
          )
        }
        existItem.update(data)
        return
      } else if (existItem.raw.urls[0] === urls[0]) {
        if (this.debug) {
          console.warn(`ignore duplicate script "${alias}"`)
        }
        return
      }
      item.version = generateVersion(item)
    } else if (bIBSheet) {
      defaultsIBSheetEvents.call(this, item)
    }

    this._list.push(item)
    return item
  }

  addAll(params: RegistryParam[], overwrite: boolean = false): RegistryItem[] {
    return castArray(params)
      .map((data: any) => {
        return this.add(data, overwrite)
      })
      .filter(Boolean) as RegistryItem[]
  }

  exists(alias: string): boolean {
    return !isNil(this.get(alias))
  }

  get(alias: string): RegistryItem | null {
    const ndx = this.getIndexByAlias(alias)
    if (ndx < 0) return null
    return this._list[ndx]
  }

  info(alias: string): string | undefined {
    let res: any = this.getAll(alias).map(item => item.raw)
    if (!res.length) return
    if (res.length === 1) res = res[0]
    return JSON.stringify(res, null, 2)
  }

  getAll(query: string): RegistryItem[] {
    const hasVersion = lastIndexOf(query, '@') > 0
    return this._list.filter(item => {
      if (hasVersion) {
        return item.alias === query
      }
      return item.name === query
    })
  }

  findOne(query: string): RegistryItem | undefined {
    const items = this.getAll(query)
    if (items.length) return items[0]
    return
  }

  findLoadedOne(query: string): RegistryItem | undefined {
    const items = this.getAll(query)
    const loadedItems = items.filter(item => item.loaded)
    if (loadedItems.length) return loadedItems[0]
    return
  }

  getIndexByAlias(alias: string): number {
    return findIndex(this._list, { alias })
  }

  update(alias: string, data: RegItemUpdateData) {
    const item = this.get(alias)
    if (isNil(item)) return
    item.update(data)
  }

  remove(alias: string): RegistryItem | RegistryItem[] | undefined {
    const items = this.getAll(alias)
    if (!items.length) return
    const ids = items.map(item => item.id)
    const result: RegistryItem[] = []
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
