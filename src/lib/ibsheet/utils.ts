import { isString, trim, get, set, isNil } from '../shared/lodash'
import { genUniqueElementId } from '../shared/dom-utils'
import {
  IBSHEET,
  IBSHEET_PREFIX,
  IBSHEET_EL_PREFIX,
  IBSHEET_GLOBAL,
} from '../constant'
import { RegistryParam } from '../registry'

/** @ignore */
export function existsIBSheetStatic(name: string = IBSHEET_GLOBAL) {
  return !isNil(get(window, name))
}

export function isIBSheet(name: string | undefined) {
  return name === IBSHEET
}

export function getIBSheetStatic(name: string = IBSHEET_GLOBAL): any {
  return get(window, name)
}

export function destroyIBSheetStatic(name: string = IBSHEET_GLOBAL) {
  const ibsheet = getIBSheetStatic(name)
  try {
    ibsheet.disposeAll(true, true)
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

export function setIBSheetLicense(value: string): void {
  let ibleaders = get(window, 'ibleaders') ?? {};
  set(window, 'ibleaders', ibleaders);
  set(ibleaders, 'license', value);
}

export function generateSheetID(): string {
  return genUniqueElementId(IBSHEET_PREFIX)
}

export function generateElementID(): string {
  return genUniqueElementId(IBSHEET_EL_PREFIX)
}
