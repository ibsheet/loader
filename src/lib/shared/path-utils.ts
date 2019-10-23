import { isEmpty } from './lodash'

export function basename(str: string): string | undefined {
  if (isEmpty(str)) return
  let base = new String(str).substring(str.lastIndexOf('/') + 1)
  if (base.lastIndexOf('.') > -1) {
    base = base.substring(0, base.lastIndexOf('.'))
  }
  return base
}
