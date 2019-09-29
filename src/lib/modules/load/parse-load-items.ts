import isUrl from 'is-url'

import { IBSHEET } from '../../constant'
import { isString, castArray, isNil, isObject } from '../../shared/lodash'
import {
  LoaderRegistry,
  LoaderRegistryItem,
  ILoaderRegistryItemData,
  getRegistryIdentifier
} from '../../registry'
import { LoaderTaskManager } from '../../task-man'

function parseLoadItemData(
  data: ILoaderRegistryItemData
): LoaderRegistryItem | undefined {
  const registry: LoaderRegistry = this.registry
  let item: any
  if (isString(data)) {
    // check localpath or url
    if (data.indexOf('/') >= 0 || isUrl(data)) {
      item = registry.add(data)
    }
    // check exists registry
    else {
      item = registry.findOne(data)
    }
  } else if (isObject(data)) {
    // is object
    const itf = getRegistryIdentifier(data)
    if (isNil(itf)) {
      item = registry.add(data)
    } else {
      const { alias } = itf
      item = registry.findOne(alias)
      if (!isNil(item)) {
        console.log(
          `%c[load.parse] updated: ${alias}`,
          'color: royalblue',
          data
        )
        item.update(data)
      } else {
        item = registry.add(data)
      }
    }
  } else {
    if (this.debug) {
      console.warn(`not supprted parameter type: ${data}`)
    }
  }
  return item
}

export function parseLoadItems(
  loadItems: ILoaderRegistryItemData[]
): LoaderRegistryItem[] {
  const taskMan: LoaderTaskManager = this._loadTaskMan

  const res = castArray(loadItems)
    .map((data: ILoaderRegistryItemData) => {
      let item: LoaderRegistryItem | undefined = parseLoadItemData.call(
        this,
        data
      )

      if (isNil(item)) {
        console.warn(`invalid paramater: ${data}`)
        return
      }

      if (item.loaded && !item.changed) {
        if (this.debug) {
          console.warn(`already loaded library: ${item.alias}`)
        }
        return
      }

      // ignore debug for default library
      if (item.name === IBSHEET) {
        if (taskMan.exists(item) && !item.changed) {
          return
        }
      }
      return item
    })
    .filter(Boolean)

  return res as LoaderRegistryItem[]
}