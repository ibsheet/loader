import { v1 as uuidv1 } from 'uuid'

import { CustomEventEmitter } from '../../custom'
import { get, isNil, isFunction } from '../../shared/lodash'
import { getFilenameFromURL } from '../utils'
import { RegItemUrlData, ValidatableItem } from './interface'

class RegistryItemURL extends CustomEventEmitter implements ValidatableItem {
  private _id: string
  private _value: string
  private _basename: string
  private _dependencies: string[] = []
  type: string = 'js'
  target: string = 'body'
  validate: (() => boolean) | null = null
  loaded: boolean = false

  constructor(data: RegItemUrlData) {
    super()
    const url = get(data, 'url')
    if (isNil(url)) {
      throw new Error(`[RegistryItemURL] invalid url, ${url}`)
    }
    this.value = url
    this.type = get(data, 'type', this.type)
    this.target = get(data, 'target', this.target)

    this._id = uuidv1()
  }

  get id(): string {
    return this._id
  }

  set value(val: string) {
    if (isNil(val) || !val.length) {
      throw new Error('undefiend registry url')
    }
    let sType
    const filename = getFilenameFromURL(val)
    if (!isNil(filename)) {
      const file = filename.split('.')
      if (file.length > 1) {
        sType = file.pop()
        this._basename = file.join('.')
      } else {
        this._basename = filename
      }
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
  get alias(): string {
    return `${this.basename}.${this.type}`
  }
  /**
   * 미리 로드되어야할 javascript의 basename 목록
   */
  get dependencies(): string[] {
    return this._dependencies
  }
  set dependencies(arr: string[]) {
    this._dependencies = arr.filter((str) => str !== this.basename)
  }

  test(): boolean {
    const fnValidate = this.validate
    if (isNil(fnValidate) || !isFunction(fnValidate)) return true
    return fnValidate()
  }
}

export { RegistryItemURL }
export default RegistryItemURL
