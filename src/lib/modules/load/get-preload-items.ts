import { get, isArray, isObject, isNil, isString } from '../../shared/lodash'

import { RegistryItem } from '../../registry'
import { validSheetRegistData } from '../../ibsheet'
import { validChartRegistData } from '../../ibchart'
import { validMapRegistData } from '../../ibmap'

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
      needRegAlias = needRegAlias && !validChartRegistData(origins)
      needRegAlias = needRegAlias && !validMapRegistData(origins)
    } else if (isArray(origins)) {
      const arrS = origins.filter((t: any) => validSheetRegistData(t))
      const arrC = origins.filter((t: any) => validChartRegistData(t))
      const arrM = origins.filter((t: any) => validMapRegistData(t))
      needRegAlias = !arrS.length && !arrC.length && !arrM.length
    }
  }

  if (needRegAlias) {
    const defItem = this._getDefaultRegItem()
    res.push(defItem.alias)
  }
  return res
}
