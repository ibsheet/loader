import { get, isArray, isObject, isNil, isString } from '../../shared/lodash'

import { LoaderRegistryItem } from '../../registry'
import { validSheetRegistData } from '../../ibsheet'

import { ILoadTaskOptions } from './interface'

export function getPreloadItems(
  origins?: any,
  options?: ILoadTaskOptions
): LoaderRegistryItem[] {
  const alsoDefaultLib = get(options, 'defaultLibrary', false)
  const needDefaultLoadTask = alsoDefaultLib && !this.loadedDefaultLib
  const noOrigins = isNil(origins)

  let needDefaultItem = false
  if (needDefaultLoadTask) {
    if (noOrigins) {
      needDefaultItem = true
    } else if (isString(origins) || isObject(origins)) {
      needDefaultItem = !validSheetRegistData(origins)
    } else if (isArray(origins)) {
      const arr = origins.filter((t: any) => validSheetRegistData(t))
      needDefaultItem = !arr.length
    }
  }

  let res = []
  if (needDefaultItem) {
    const defItem = this._getDefaultRegItem()
    res.push(defItem.alias)
  }

  return res
}
