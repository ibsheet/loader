import { get, isArray, isObject, isNil, isString } from '../../shared/lodash'

import { RegistryItem } from '../../registry'
import { validSheetRegistData } from '../../ibsheet'

import { LoadTaskOptions } from './interface'

export function getPreloadItems(
  origins?: any,
  options?: LoadTaskOptions,
): RegistryItem[] {
  const alsoDefaultLib = get(options, 'defaultLibrary', false)
  const needDefaultLoadTask = alsoDefaultLib && !this.loadedDefaultLib
  const noOrigins = isNil(origins)
  const res = []

  let needRegAlias = false
  if (needDefaultLoadTask) {
    if (noOrigins) {
      needRegAlias = true
    } else if (isString(origins) || isObject(origins)) {
      needRegAlias = !validSheetRegistData(origins)
    } else if (isArray(origins)) {
      const arr = origins.filter((t: any) => validSheetRegistData(t))
      needRegAlias = !arr.length
    }
  }

  if (needRegAlias) {
    const defItem = this._getDefaultRegItem()
    res.push(defItem.alias)
  }
  return res
}
