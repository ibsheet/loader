import {
  LoaderRegistryDataType,
  ILoaderRegistryItem,
  ILoaderRegistryItemData
} from './interface'
import {
  isString, isNil,
  isNumber, toNumber
} from '../shared/lodash'

/**
 * 인자가 문자열일 경우, ILoaderRegistryItemData 인터페이스로 캐스팅
 * @param param
 * @hidden
 */
export function castLoaderRegistryItemData(
  param: LoaderRegistryDataType
): ILoaderRegistryItemData {
  if (isString(param)) {
    return { url: param }
  }
  return param
}

const VERSION_GENERATE_START_NUM = 2
/**
 * 별칭이 중복될 경우 임의로 버전을 업데이트
 * @param item
 * @hidden
 */
export function generateVersion(item: ILoaderRegistryItem): string {
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
