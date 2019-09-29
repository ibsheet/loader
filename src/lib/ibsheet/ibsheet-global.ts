import { IBSHEET_GLOBAL } from '../constant'
import { has, isNil } from '../shared/lodash'
import { IBSheetGlobalStatic, IBSheetCreateOptions } from './interface'

class IBSheetGlobal implements IBSheetGlobalStatic {
  constructor() {
    return this
  }
  private get _global(): any {
    return window[IBSHEET_GLOBAL]
  }
  async create(options: IBSheetCreateOptions): Promise<any> {
    const ibsheet = this._global
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
      console.error(err)
    }
  }
}

export const IBSheetGlobalInstance = new IBSheetGlobal()
