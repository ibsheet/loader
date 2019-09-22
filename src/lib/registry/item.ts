import {
  ILoaderRegistryItem,
  ILoaderRegistryItemData,
  ILoaderRegistryItemRawData,
} from './interface'
import { castLoaderRegistryItemData } from './utils'
import { get, isNil } from '../shared/lodash'
import { basename } from 'path'
import { parse as UrlParse } from 'url'
import uuid from 'uuid/v1'

/**
 * @hidden
 */
const getFilenameFromURL = (url: string): string => {
  let { pathname } = UrlParse(url)
  if (isNil(pathname)) {
    console.warn(
      '[UrlParser]',
      `${url} failed parse basename`
    )
    return 'undefined'
  }
  return basename(pathname)
}

class LoaderRegistryItem implements ILoaderRegistryItem {
  private _id: string
  private _name: string
  private _version: string | null
  private _url: string
  private _basename: string
  private _loadedValidator: Function | null
  type: string
  target: string

  constructor(data: string | ILoaderRegistryItemData) {
    data = castLoaderRegistryItemData(data)
    this.url = get(data, 'url')

    // name
    this.name = get(data, 'name', this.basename)
    if (isNil(this.name ) || !this.name.length) {
      throw new Error(`invalid url or required name property: ${this.url}`)
    }

    // version
    this.version = get(data, 'version', null)

    // test callback
    this._loadedValidator = get(data, 'test', null)

    // type
    this.type = get(data, 'type', this.type)
    if (isNil(this.type)) {
      throw new Error(`invalid url or required type property: ${this.url}`)
    }

    // target
    let target = get(data, 'target')
    if (isNil(target)) {
      target = (this.type === 'css') ? 'head' : 'body'
    }
    this.target = target

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
  get basename(): string { return this._basename }
  get url(): string {
    return this._url
  }
  set url(value: string) {
    if (isNil(value) || !value.length) {
      throw new Error('undefiend registry url')
    }
    const basename = getFilenameFromURL(value)
    const file = basename.split('.')
    if (file.length > 1) {
      this.type = file.pop() as string
      this._basename = file.join('.')
    } else {
      this._basename = basename
    }
    this._url = value
  }

  test(): boolean {
    const validator = this._loadedValidator
    if (isNil(validator)) return true
    return validator.call(window)
  }

  get jsonData(): ILoaderRegistryItemRawData {
    return {
      id: this.id,
      url: this.url,
      name: this.name,
      version: this.version,
      alias: this.alias,
      type: this.type,
      target: this.target,
      test: this._loadedValidator
    }
  }
  public toString = (): string => {
    return `${this.alias}: ${this.url}`
  }
}

export { LoaderRegistryItem }
export default LoaderRegistryItem
