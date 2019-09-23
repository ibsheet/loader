import {
  get, set, isNil, has, castArray, pick,
  trim
} from '../../shared/lodash'
import { castRegistryItemData } from '../utils'
import {
  ILoaderRegistryItem,
  ILoaderRegistryItemData,
  ILoaderRegistryItemRawData,
  IRegistryItemUrlData,
  IRegistryItemURL
} from './interface'
import { RegistryItemURL } from './url'

import uuid from 'uuid/v1'

class LoaderRegistryItem implements ILoaderRegistryItem {
  private _id: string
  private _name: string
  private _version: string | null
  private _urls: IRegistryItemURL[]
  private _loadedValidator: Function | null

  constructor(data: string | ILoaderRegistryItemData) {
    data = castRegistryItemData(data)

    const hasUrl = has(data, 'url')
    const hasUrls = has(data, 'urls')
    if (!hasUrl && !hasUrls) {
      throw new Error('required "url" or "urls" property')
    }

    if (hasUrl && hasUrls) {
      console.warn('ignore "url" property, cannot be used with the "urls"')
    }

    const urls: any = get(data, 'urls', pick(data, ['url', 'target', 'type']))
    const baseUrl = get(data, 'baseUrl')
    this._urls = castArray(urls).map(_data => {
      _data = castRegistryItemData(_data) as IRegistryItemUrlData
      const { url } = _data
      if (!isNil(baseUrl) && !/^\w+:\/\//.test(url)) {
        set(_data, 'url', [
          trim(baseUrl).replace(/\/$/, ''),
          trim(url).replace(/^\//, '')
        ].join('/'))
      }
      return new RegistryItemURL(_data)
    })

    // name
    const firstUrl = this.urls[0]
    this.name = get(data, 'name', firstUrl.basename)
    if (isNil(this.name) || !this.name.length) {
      throw new Error(
        `invalid url or required name property: ${firstUrl.value}`
      )
    }

    // version
    this.version = get(data, 'version', null)

    // test callback
    this._loadedValidator = get(data, 'test', null)

    // id
    this._id = uuid()
    return this
  }

  get id(): string {
    return this._id
  }
  get name(): string {
    return this._name
  }
  set name(value: string) {
    this._name = value
  }
  get version(): string | null {
    return this._version
  }
  set version(value: string | null) {
    this._version = value
  }
  get hasVersion(): boolean {
    return !isNil(this.version)
  }
  get alias(): string {
    if (this.hasVersion) {
      return `${this.name}@${this.version}`
    }
    return this.name
  }
  get urls(): IRegistryItemURL[] {
    return this._urls
  }
  test(): boolean {
    const validator = this._loadedValidator
    if (isNil(validator)) return true
    return validator.call(window)
  }

  get raw(): ILoaderRegistryItemRawData {
    return {
      id: this.id,
      urls: this.urls.map(url => url.value),
      name: this.name,
      version: this.version,
      alias: this.alias,
      test: this._loadedValidator
    }
  }
  public toString = (): string => {
    return this.alias
  }
}

export { LoaderRegistryItem }
export default LoaderRegistryItem
