import { isString, trim, get, isNil } from '../shared/lodash'
import { IBSHEET } from '../constant'
import { LoaderRegistryDataType } from '../registry'

export function validSheetRegistData(param?: LoaderRegistryDataType): boolean {
  if (isString(param)) {
    return param.indexOf(IBSHEET) > -1
  }
  const name = get(param, 'name')
  if (isNil(name)) return false
  return trim(name) === IBSHEET
}
