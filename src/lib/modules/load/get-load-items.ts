import { isNil, concat } from '../../shared/lodash'
import { RegistryItem } from '../../registry'
import { getPreloadItems } from './get-preload-items'
import { parseLoadItems } from './parse-load-items'

export function getLoadItems(
  origins?: any,
  defaultLibrary: boolean = true
): RegistryItem[] {
  const preLoadItems = getPreloadItems.apply(this, [
    origins,
    { defaultLibrary }
  ])

  const noOrigins = isNil(origins)
  let aLoadItems
  if (preLoadItems.length) {
    aLoadItems = noOrigins ? preLoadItems : concat(preLoadItems, origins)
  } else if (!noOrigins) {
    aLoadItems = [origins]
  }

  // no action
  if (isNil(aLoadItems)) return []

  return parseLoadItems.call(this, aLoadItems)
}
