import { basename } from 'path'
import { parse as UrlParse } from 'url'
import uuid from 'uuid/v1'

import { get, isNil } from '../../shared/lodash'

import { IRegistryItemUrlData, IRegistryItemURL } from './interface'

/**
 * @hidden
 */
const getFilenameFromURL = (url: string): string => {
  let { pathname } = UrlParse(url)
  if (isNil(pathname)) {
    console.warn('[UrlParser]', `${url} failed parse basename`)
    return 'undefined'
  }
  return basename(pathname)
}

class RegistryItemURL implements IRegistryItemURL {
  private _id: string
  private _value: string
  private _basename: string
  type: string = 'js'
  target: string = 'body'

  constructor(data: IRegistryItemUrlData) {
    // console.log(data)
    let url = get(data, 'url')
    if (isNil(url)) {
      throw new Error(`[RegistryItemURL] invalid url, ${url}`)
    }
    this.value = url
    this.type = get(data, 'data', this.type)
    this.target = get(data, 'data', this.target)
    this._id = uuid()
  }

  get id(): string {
    return this._id
  }

  set value(val: string) {
    if (isNil(val) || !val.length) {
      throw new Error('undefiend registry url')
    }
    const basename = getFilenameFromURL(val)
    const file = basename.split('.')
    let sType = null
    if (file.length > 1) {
      sType = file.pop()
      this._basename = file.join('.')
    } else {
      this._basename = basename
    }
    if (!isNil(sType)) {
      this.type = sType
      this.target = sType === 'css' ? 'head' : 'body'
    }
    this._value = val
  }
  get value(): string {
    return this._value
  }
  get basename(): string {
    return this._basename
  }
}

export { RegistryItemURL }
export default RegistryItemURL
