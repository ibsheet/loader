import { parse as UrlParse } from 'url'

import {
  get,
  set,
  isString,
  isNil,
  trim,
  find,
  isNumber,
  toNumber,
  last
} from '../shared/lodash'
import { VERSION_GENERATE_START_NUM } from '../config'
import { RegistryParam, RegistryIdentifier } from './interface'
import { RegistryItem, RegistryItemData, RegItemUrlData } from './item'

/**
 * 인자가 문자열일 경우, RegistryItemData 인터페이스로 캐스팅
 * @param param
 * @hidden
 */
export function castRegistryItemData(
  param: RegistryParam | RegItemUrlData
): RegistryItemData {
  if (isString(param)) {
    return { url: param }
  }
  return param
}

/**
 * @hidden
 */
export const getFilenameFromURL = (
  url: string | undefined
): string | undefined => {
  if (isNil(url)) return
  let { pathname } = UrlParse(url)
  if (isNil(pathname)) {
    console.warn('[UrlParser]', `${url} failed parse basename`)
    return
  }
  return last(pathname.split('/'))
}

export function castRegistryAlias(data: RegistryItemData): string | undefined {
  const idf = getRegistryIdentifier(data)
  if (isNil(idf)) return
  return idf.alias
}

export function getRegistryIdentifier(
  data: RegistryItemData
): RegistryIdentifier | undefined {
  let name = get(data, 'name')
  const url = get(data, 'url')
  if (isNil(name) && !isNil(url)) {
    name = getFilenameFromURL(url)
  }
  if (isNil(name) || !name.length) return
  name = trim(name)
  const res = {
    name,
    alias: name
  }
  let version = get(data, 'version')
  if (!isNil(version)) {
    version = trim(version)
    set(res, 'version', version)
    set(res, 'alias', [name, version].join('@'))
    // alias += `@${version}`
  }
  return res
}

/**
 * 별칭이 중복될 경우 임의로 버전을 업데이트
 * @param item
 * @hidden
 */
export function generateVersion(item: RegistryItem): string {
  const { version: ver } = item

  if (isNil(ver)) {
    return '' + VERSION_GENERATE_START_NUM
  }
  if (ver.indexOf('-') < 0) {
    return `${ver}-${VERSION_GENERATE_START_NUM}`
  }

  const arr = ver.split('-')
  let num: any = arr.pop()
  if (!isNumber(num)) {
    return `${ver}-${VERSION_GENERATE_START_NUM}`
  }
  return `${arr.join('-')}-${toNumber(num) + 1}`
}

/**
 * if not exists push url
 * @param urls
 * @param url
 */
export function pushIfNotExistsUrl(urls: { url: string }[], url: string) {
  const exists = find(urls, o => o.url.indexOf(url) > -1)
  if (isNil(exists)) {
    urls.push({ url })
  }
}
