import uuid from 'uuid/v1'

import { CustomEventEmitter } from '../../custom'
import {
  get,
  set,
  isNil,
  has,
  castArray,
  pick,
  trim,
  assignIn
} from '../../shared/lodash'
import { castRegistryItemData } from '../utils'
import { LoaderEvent } from '../../interface'
import {
  ILoaderRegistryItem,
  ILoaderRegistryItemData,
  ILoaderRegistryItemRawData,
  ILoaderRegistryItemOptions,
  IRegistryItemUrlData,
  IRegistryItemURL
} from './interface'
import { RegistryItemURL } from './url'
import { asyncImportItemUrls } from './async-load'
import { asyncRemoveItemUrls } from './async-unload'
import { asyncItemTest } from './async-test'

class LoaderRegistryItem extends CustomEventEmitter implements ILoaderRegistryItem {
  private _id: string
  private _name: string
  private _version: string | null
  private _urls: IRegistryItemURL[]
  private _loaded: boolean = false
  private _options: ILoaderRegistryItemOptions
  error = null

  constructor(data: string | ILoaderRegistryItemData) {
    super()
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
        set(
          _data,
          'url',
          [trim(baseUrl).replace(/\/$/, ''), trim(url).replace(/^\//, '')].join(
            '/'
          )
        )
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

    // event options
    this._options = pick(data, [
      'validate', 'load', 'unload',
      'dependentUrls'
    ])

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
  private _customEventHandle(name: string, ...args: any[]) {
    const fn = this.getOption(name)
    if (isNil(fn)) return
    fn.apply(this, args)
  }
  getOption(name: string, def?: any) {
    return get(this._options, name, def)
  }
  setOption(name: string, value: any): void {
    set(this._options, name, value)
  }
  test(): boolean {
    const validator = this.getOption('validate')
    if (isNil(validator)) return true
    return validator.call(window)
  }
  get loaded(): boolean {
    return this._loaded
  }
  load(options?: any): this {
    const eventData = { target: this }
    this.emit(LoaderEvent.LOAD, eventData)
    asyncImportItemUrls
      .call(this, options)
      .then(() => {
        // urls
        asyncItemTest
          .call(this, options)
          .then(() => {
            // item
            this._loaded = true
            this.emit(LoaderEvent.LOADED, eventData)
            this._customEventHandle('load', {
              type: LoaderEvent.LOADED,
              target: this
            })
          })
          .catch(() => {
            this.emit(LoaderEvent.LOAD_FAILED, eventData)
          })
      })
      .catch((err: any) => {
        this.emit(LoaderEvent.LOAD_REJECT, assignIn(eventData, err))
      })
    return this
  }
  unload(options?: any): this {
    const eventData = { target: this }
    this.emit(LoaderEvent.UNLOAD, eventData)
    asyncRemoveItemUrls
      .call(this, options)
      .then(() => {
        this._loaded = false
        this.emit(LoaderEvent.UNLOADED, eventData)
        this._customEventHandle('unload', {
          type: LoaderEvent.UNLOADED,
          target: this
        })
      })
      .catch((err: any) => {
        this.emit(LoaderEvent.UNLOAD_FAILED, assignIn(eventData, err))
      })
    return this
  }

  get raw(): ILoaderRegistryItemRawData {
    const raw = {
      id: this.id,
      urls: this.urls.map(url => url.value),
      name: this.name,
      version: this.version,
      alias: this.alias,
      loaded: this.loaded
    }
    if (!isNil(this.error)) {
      set(raw, 'error', this.error)
    }
    return raw
  }
  // @override
  public emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, assignIn({ type: event }, ...args))
  }
  public toString = (): string => { return this.alias }
}

export { LoaderRegistryItem }
export default LoaderRegistryItem
