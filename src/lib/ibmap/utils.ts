import { isString, trim, get, set, isNil } from '../shared/lodash'
import { genUniqueElementId } from '../shared/dom-utils'
import { IBMAP, IBMAP_GLOBAL, IBMAP_PREFIX, IBMAP_EL_PREFIX } from '../constant'
import { RegistryParam } from '../registry'

/** @ignore */
export function existsIBMapStatic(name: string = IBMAP_GLOBAL) {
  return !isNil(get(window, name))
}

export function isIBMap(name: string | undefined) {
  return name === IBMAP
}

export function getIBMapStatic(name: string = IBMAP_GLOBAL): any {
  return get(window, name)
}

export function destroyIBMapStatic(name: string = IBMAP_GLOBAL) {
  const ibmap = getIBMapStatic(name)
  try {
    for (let i = 0; i < ibmap.length; i++) {
      ibmap[i].dispose()
    }
    Object.keys(ibmap).forEach((key) => delete ibmap[key])
  } catch (err) {
    console.warn('IBMap disposeAll failed:', err)
  }
  set(window, name, undefined)
}

export function validMapRegistData(param?: RegistryParam): boolean {
  if (isString(param)) {
    return param.indexOf(IBMAP) > -1
  }
  const name = get(param, 'name')
  if (isNil(name)) return false
  return trim(name) === IBMAP
}

export function setIBMapLicense(value: string): void {
  const ibleaders = get(window, 'ibleaders') ?? {}
  set(window, 'ibleaders', ibleaders)
  const ibmap = get(ibleaders, 'ibmap') ?? {}
  set(ibmap, 'license', value)
  set(ibleaders, 'ibmap', ibmap)
}

export function generateMapID(): string {
  return genUniqueElementId(IBMAP_PREFIX)
}

export function generateElementID(): string {
  return genUniqueElementId(IBMAP_EL_PREFIX)
}
