import { parse as UrlParse } from 'url'

import {
  get,
  set,
  isString,
  isNil,
  trim,
  isNumber,
  toNumber
} from '../shared/lodash'
import { VERSION_GENERATE_START_NUM } from '../config'
import { LoaderRegistryDataType, IRegistryIdentifier } from './interface'
import {
  LoaderRegistryItem,
  ILoaderRegistryItemData,
  IRegistryItemUrlData
} from './item'

/**
 * 인자가 문자열일 경우, ILoaderRegistryItemData 인터페이스로 캐스팅
 * @param param
 * @hidden
 */
export function castRegistryItemData(
  param: LoaderRegistryDataType | IRegistryItemUrlData
): ILoaderRegistryItemData {
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
  // todo: angular package error
  // return path.basename(pathname)
  return pathname
}

export function castRegistryAlias(
  data: ILoaderRegistryItemData
): string | undefined {
  const idf = getRegistryIdentifier(data)
  if (isNil(idf)) return
  return idf.alias
}

export function getRegistryIdentifier(
  data: ILoaderRegistryItemData
): IRegistryIdentifier | undefined {
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
export function generateVersion(item: LoaderRegistryItem): string {
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
