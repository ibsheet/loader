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
  defaultsDeep,
  assignIn,
  isEmpty
} from '../../shared/lodash'
import { LoaderEvent } from '../../interface'

import { castRegistryItemData } from '../utils'
import {
  ILoaderRegistryItem,
  ILoaderRegistryItemData,
  ILoaderRegistryItemRawData,
  IRegistryItemEventOptions,
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
  private _urlOptions: IRegistryItemUrlData
  private _evtOptions: IRegistryItemEventOptions
  error = null

  constructor(data: string | ILoaderRegistryItemData) {
    super()
    data = castRegistryItemData(data)

    this.update(data)

    if (isNil(this.urls)) {
      throw new Error('required "url" or "urls" property')
    }

    // name
    const firstUrl = this.urls[0]
    const name = get(data, 'name', firstUrl.basename)
    if (isNil(name) || !name.length) {
      throw new Error(
        `required name property, not found from url: ${firstUrl.value}`
      )
    }
    this.name = trim(name)

    // version
    this.version = get(data, 'version', null)

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

  private _customEventHandle(name: string, ...args: any[]) {
    const fn = this.getEventOption(name)
    if (isNil(fn)) return
    fn.apply(this, args)
  }

  private _setUrls(data: ILoaderRegistryItemData) {
    const targetOpts = pick(data, [
      'baseUrl',
      'url',
      'type',
      'target',
      'urls',
    ])
    if (isEmpty(targetOpts)) {
      return
    }
    const options = defaultsDeep(targetOpts, this._urlOptions)
    const hasUrl = has(options, 'url')
    const hasUrls = has(options, 'urls')

    if (hasUrl && hasUrls) {
      console.warn('ignore "url" property, cannot be used with the "urls"')
    }

    const urls: any = get(options, 'urls', pick(options, ['url', 'target', 'type']))
    const baseUrl = get(options, 'baseUrl')
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
    this._urlOptions = options
  }

  private _setEventOptions(data: ILoaderRegistryItemData) {
    const targetOpts = pick(data, [
      'validate',
      'load',
      'unload',
      'dependentUrls'
    ])
    if (isEmpty(targetOpts)) {
      return
    }
    this._evtOptions = defaultsDeep(targetOpts, this._evtOptions)
  }
  getEventOption(name: string, def?: any): any {
    return get(this._evtOptions, name, def)
  }
  setEventOption(name: string, value: any): void {
    set(this._evtOptions, name, value)
  }

  update(data: any): void {
    if (isNil(data)) return
    data = castRegistryItemData(data)
    this._setUrls(data)
    this._setEventOptions(data)
  }

  test(): boolean {
    const validator = this.getEventOption('validate')
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

  // @override
  public emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, assignIn({ type: event }, ...args))
  }
  public toString = (): string => { return this.alias }
}

export { LoaderRegistryItem }
export default LoaderRegistryItem
