import { isEmpty, isNil } from './lodash'
import isUrl from 'is-url'

export function basename(str: string): string | undefined {
  if (isEmpty(str)) return
  let base = new String(str).substring(str.lastIndexOf('/') + 1)
  if (base.lastIndexOf('.') > -1) {
    base = base.substring(0, base.lastIndexOf('.'))
  }
  return base
}

export function isUrlStr(str: string | undefined): boolean {
  if (isNil(str) || isEmpty(str)) return false
  return str.indexOf('/') >= 0 || isUrl(str)
}

export function isFilePath(str: string | undefined, type?: string): boolean {
  if (isNil(str) || isEmpty(str)) return false
  const bUrl = str.indexOf('/') >= 0 || isUrl(str)
  let bFile: boolean = false
  if (!isNil(type) && !isEmpty(type)) {
    bFile = new RegExp(`\\.${type}$`, 'i').test(str)
  }
  return bUrl || bFile
}
