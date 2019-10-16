import { isString, trim, get, set, isNil } from '../shared/lodash'
import { IBSHEET, IBSHEET_GLOBAL } from '../constant'
import { RegistryParam } from '../registry'

export function existsIBSheetStatic(name: string = IBSHEET_GLOBAL) {
  return !isNil(get(window, name))
}

export function getIBSheetStatic(name: string = IBSHEET_GLOBAL) {
  return get(window, name)
}

export function destroyIBSheetStatic(name: string = IBSHEET_GLOBAL) {
  const ibsheet = getIBSheetStatic(name)
  try {
    ibsheet.disposeAll()
  } catch (err) {
    // nothing
  }
  set(window, name, undefined)
}

export function validSheetRegistData(param?: RegistryParam): boolean {
  if (isString(param)) {
    return param.indexOf(IBSHEET) > -1
  }
  const name = get(param, 'name')
  if (isNil(name)) return false
  return trim(name) === IBSHEET
}
