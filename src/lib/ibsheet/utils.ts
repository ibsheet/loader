import { isString, trim, get, isNil } from '../shared/lodash'
import { IBSHEET, IBSHEET_GLOBAL } from '../constant'
import { RegistryParam } from '../registry'

export function getIBSheetStatic(name: string = IBSHEET_GLOBAL) {
  return get(window, name)
}

export function validSheetRegistData(param?: RegistryParam): boolean {
  if (isString(param)) {
    return param.indexOf(IBSHEET) > -1
  }
  const name = get(param, 'name')
  if (isNil(name)) return false
  return trim(name) === IBSHEET
}
