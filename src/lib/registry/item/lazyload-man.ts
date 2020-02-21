import { remove } from '../../shared/lodash'
import { CustomEventEmitter } from '../../custom'
import RegistryItemURL from './url'

export class LazyLoadURLManager extends CustomEventEmitter {
  /** @ignore */
  private _list: RegistryItemURL[] = []
  /** @ignore */
  private _loadedDendencies: string[] = []

  constructor() {
    super()
  }

  add(item: RegistryItemURL) {
    this._list.push(item)
  }

  checkLoadableItems(lItem: RegistryItemURL): RegistryItemURL[] {
    const lazyItems = this._list
    if (!lazyItems.length) return []
    const loadedList = this._loadedDendencies
    loadedList.push(lItem.basename)
    const nextLoadItems = remove(lazyItems, (item: RegistryItemURL) => {
      return item.dependencies.some(bname => loadedList.includes(bname))
    })
    return nextLoadItems
  }
}
