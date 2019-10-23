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
  isEmpty,
  sortBy,
  includes
} from '../../shared/lodash'
import { LoaderEventName } from '../../interface'
import { isIBSheet } from '../../ibsheet'

import { castRegistryItemData, castRegistryAlias } from '../utils'
import {
  RegistryItemData,
  RegItemRawData,
  RegItemEventOptions,
  RegItemUrlData,
  RegItemEventName
} from './interface'
import { RegistryItemURL } from './url'
import { asyncImportItemUrls } from './async-load'
import { asyncRemoveItemUrls } from './async-unload'
import { asyncItemTest } from './async-test'
import { defaultsIBSheetUrls } from '../for-ibsheet'

class RegistryItem extends CustomEventEmitter {
  private _id: string
  private _name: string | undefined
  private _version: string | null
  private _urls: RegistryItemURL[]
  private _loaded: boolean = false
  private _isResolveUpdateUrls: boolean
  private _updateUrls: RegistryItemURL[]
  private _urlOptions: RegItemUrlData = {}
  private _evtOptions: RegItemEventOptions = {}
  error = null

  constructor(data: string | RegistryItemData) {
    super()
    data = castRegistryItemData(data)
    this._updateUrls = []
    this.name = get(data, 'name')

    // url, evt
    this.update(data, false)

    if (isNil(this.urls)) {
      throw new Error('required "url" or "urls" property')
    }

    // name
    if (isNil(this.name)) {
      const firstUrl = this.urls[0]
      const name = firstUrl.basename
      if (isNil(name) || !name.length) {
        throw new Error(
          `required name property, not found from url: ${firstUrl.value}`
        )
      }
      this.name = name
    }

    // version
    this.version = get(data, 'version', null)

    // id
    this._id = uuid()
    return this
  }

  get id(): string {
    return this._id
  }
  get name(): string | undefined {
    return this._name
  }
  set name(value: string | undefined) {
    if (isEmpty(value)) return
    this._name = trim(value).toLowerCase()
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
    return castRegistryAlias({
      name: this.name,
      version: this.version
    }) as string
  }
  get urls(): RegistryItemURL[] {
    return this._urls
  }
  get updateUrls(): RegistryItemURL[] {
    return this._updateUrls
  }
  get isResolveUpdateUrls(): boolean {
    if (!this.changed) return true
    return this._isResolveUpdateUrls
  }

  get raw(): RegItemRawData {
    const raw = {
      id: this.id,
      urls: this.urls.map(url => url.value),
      name: this.name as string,
      version: this.version,
      alias: this.alias,
      loaded: this.loaded
    }
    if (!isNil(this.error)) {
      set(raw, 'error', this.error)
    }
    return raw
  }

  get loaded(): boolean {
    return this._loaded
  }
  get changed(): boolean {
    return !!this._updateUrls.length
  }

  private _customEventHandle(name: string, ...args: any[]) {
    const fn = this.getEventOption(name)
    if (isNil(fn)) return
    fn.apply(this, args)
  }

  private _createUrls(data: RegistryItemData): RegistryItemURL[] | undefined {
    const targetOpts = pick(data, [
      'baseUrl',
      'url',
      'type',
      'target',
      'urls',
      'corefile',
      'theme',
      'plugins',
      'locale',
      'license'
    ])
    if (isEmpty(targetOpts)) {
      return
    }

    const bIBSheet = isIBSheet(this.name)

    const options = defaultsDeep(targetOpts, this._urlOptions)
    this._urlOptions = options

    const hasUrl = has(options, 'url')
    const hasUrls = has(options, 'urls')

    if (hasUrl && hasUrls) {
      console.warn('ignore "url" property, cannot be used with the "urls"')
    }

    let urls: any
    if (!bIBSheet) {
      urls = get(options, 'urls', pick(options, ['url', 'target', 'type']))
    } else {
      urls = defaultsIBSheetUrls(data)
    }

    if (isEmpty(urls)) return

    const baseUrl = get(options, 'baseUrl')
    const res = castArray(urls).map(data => {
      data = castRegistryItemData(data) as RegItemUrlData
      const { url } = data
      if (!isNil(baseUrl) && !/^\w+:\/\//.test(url)) {
        set(
          data,
          'url',
          [trim(baseUrl).replace(/\/$/, ''), trim(url).replace(/^\//, '')].join(
            '/'
          )
        )
      }
      return new RegistryItemURL(data)
    })
    return res
  }
  private _setUrls(data: RegistryItemData, isUpdate: boolean = false): void {
    const urls = this._createUrls(data)

    if (isNil(urls)) return
    if (isUpdate) {
      this._updateUrls = urls
      return
    }
    this._urls = urls
  }

  private _setEventOptions(data: RegistryItemData) {
    const targetOpts = pick(data, [
      RegItemEventName.VALIDATE,
      RegItemEventName.LOAD,
      RegItemEventName.UNLOAD,
      RegItemEventName.DEPENDENT_URLS
    ])
    if (isEmpty(targetOpts)) {
      return
    }
    this._evtOptions = defaultsDeep(targetOpts, this._evtOptions)
  }
  getEventOption(name: string, def?: any): any {
    return get(this._evtOptions, name, def)
  }
  hasEventOption(name: string): boolean {
    return !isNil(get(this._evtOptions, name))
  }
  setEventOption(name: string, value: any): void {
    set(this._evtOptions, name, value)
  }
  resolveUpdateUrls(callback: (...args: any[]) => void) {
    if (this.isResolveUpdateUrls) return
    this._isResolveUpdateUrls = true
    this.once(LoaderEventName.LOADED, callback)
  }
  clearUpdateUrls(): void {
    if (!this.changed) return
    this._urls = this._updateUrls.slice()
    this._updateUrls = []
    this._isResolveUpdateUrls = false
  }

  update(data: any, isUpdate: boolean = true): void {
    if (isNil(data)) return
    data = castRegistryItemData(data)
    this._setUrls(data, isUpdate)
    this._setEventOptions(data)
    // custom sort
    this._urls = sortBy(this._urls, url => {
      let nOrder: number
      const { type, value } = url
      const corefile = get(this._urlOptions, 'corefile', 'ibsheet.js')
      if (type === 'css') {
        nOrder = 1
      } else if (isIBSheet(this.name)) {
        if (includes(value, 'ibleaders.js')) nOrder = 3
        // license
        else if (includes(value, 'locale/')) nOrder = 4
        // locale
        else if (includes(value, corefile)) nOrder = 5
        // corefile
        else nOrder = 6 // plugins
      } else {
        nOrder = 2
      }
      return nOrder
    })
    // console.log(this._urls)
  }

  test(): boolean {
    const validator = this.getEventOption('validate')
    if (isNil(validator)) return true
    return validator.call(window)
  }
  load(options?: any): this {
    const eventData = { target: this }
    this.clearUpdateUrls()
    try {
      this._customEventHandle('load', {
        type: LoaderEventName.LOADED,
        target: this
      })
    } catch (err) {
      throw new Error(err)
    }
    this.emit(LoaderEventName.LOAD, eventData)
    asyncImportItemUrls
      .call(this, options)
      .then(() => {
        // urls
        asyncItemTest
          .call(this, options)
          .then(() => {
            // item
            this._loaded = true
            this.emit(LoaderEventName.LOADED, eventData)
          })
          .catch(() => {
            this.emit(LoaderEventName.LOAD_FAILED, eventData)
          })
      })
      .catch((err: any) => {
        this.emit(LoaderEventName.LOAD_REJECT, assignIn(eventData, err))
      })
    return this
  }
  unload(options?: any): this {
    const eventData = { target: this }
    this.emit(LoaderEventName.UNLOAD, eventData)
    try {
      this._customEventHandle('unload', {
        type: LoaderEventName.UNLOAD,
        target: this
      })
    } catch (err) {
      throw new Error(err)
    }
    asyncRemoveItemUrls
      .call(this, options)
      .then(() => {
        this._loaded = false
        this.emit(LoaderEventName.UNLOADED, eventData)
      })
      .catch((err: any) => {
        this.emit(LoaderEventName.UNLOAD_FAILED, assignIn(eventData, err))
      })
    return this
  }

  // @override
  public emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, assignIn({ type: event }, ...args))
  }
  public toString = (): string => {
    return this.alias
  }
}

export { RegistryItem }
export default RegistryItem
