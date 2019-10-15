import { IBSHEET_GLOBAL } from '../constant'
import { has, isNil } from '../shared/lodash'
import { IBSheetGlobalStatic, IBSheetCreateOptions, IBSheetInstance } from './interface'

class IBSheetGlobal implements IBSheetGlobalStatic {
  constructor() {
    return this
  }
  private get _global(): IBSheetGlobalStatic {
    return window[IBSHEET_GLOBAL]
  }
  async create (options: IBSheetCreateOptions): Promise<IBSheetInstance> {
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
      throw new Error(err)
    }
  }
}

export const IBSheetGlobalInstance = new IBSheetGlobal()
