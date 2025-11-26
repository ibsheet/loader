import { isString, trim, get, set, isNil } from '../shared/lodash'
import { genUniqueElementId } from '../shared/dom-utils'
import {
  IBCHART,
  IBCHART_GLOBAL,
  IBCHART_PREFIX,
  IBCHART_EL_PREFIX,
} from '../constant'
import { RegistryParam } from '../registry'

/** @ignore */
export function existsIBChartStatic(name: string = IBCHART_GLOBAL) {
  return !isNil(get(window, name))
}

export function isIBChart(name: string | undefined) {
  return name === IBCHART
}

export function getIBChartStatic(name: string = IBCHART_GLOBAL): any {
  return get(window, name)
}

export function destroyIBChartStatic(name: string = IBCHART_GLOBAL) {
  const ibchart = getIBChartStatic(name)
  try {
    for (let i = 0; i < ibchart.length; i++) {
      ibchart[i].dispose()
    }
    Object.keys(ibchart).forEach((key) => delete ibchart[key])
  } catch (err) {
    console.warn('IBChart disposeAll failed:', err)
  }
  set(window, name, undefined)
}

export function validChartRegistData(param?: RegistryParam): boolean {
  if (isString(param)) {
    return param.indexOf(IBCHART) > -1
  }
  const name = get(param, 'name')
  if (isNil(name)) return false
  return trim(name) === IBCHART
}

export function setIBChartLicense(value: string): void {
  // chart는 ibsheet와 동일한 위치에 license를 설정함
  const ibleaders = get(window, 'ibleaders') ?? {}
  set(window, 'ibleaders', ibleaders)
  set(ibleaders, 'license', value)
}

export function generateChartID(): string {
  return genUniqueElementId(IBCHART_PREFIX)
}

export function generateElementID(): string {
  return genUniqueElementId(IBCHART_EL_PREFIX)
}
