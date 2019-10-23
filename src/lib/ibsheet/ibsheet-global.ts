import { IBSHEET_GLOBAL } from '../constant'
import { has, isNil } from '../shared/lodash'

import { IBSheetCreateOptions, IBSheetInstance } from './interface'
import { getIBSheetStatic } from './utils'

/**
 * @hidden
 */
export class IBSheetGlobalStatic {
  private _name: string
  constructor(name: string = IBSHEET_GLOBAL) {
    this._name = name
    return this
  }
  get name(): string {
    return this._name
  }
  get global(): any {
    return getIBSheetStatic(this.name)
  }
  setGlobalName(name: string): void {
    if (isNil(name)) return
    this._name = name
  }
  async create(options: IBSheetCreateOptions): Promise<IBSheetInstance> {
    const ibsheet = this.global
    if (isNil(options)) {
      throw new Error('undefined options')
    }
    if (!has(options, 'id')) {
      throw new Error('"id" property is required')
    }
    if (!has(options, 'el')) {
      throw new Error('"el" property is required')
    }
    if (!has(options, 'options')) {
      throw new Error('"options" property is required')
    }
    try {
      return await ibsheet.create(options)
    } catch (err) {
      throw new Error(err)
    }
  }
}
