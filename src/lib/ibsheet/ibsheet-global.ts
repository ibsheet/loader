import { has, isNil } from '../shared/lodash'

import {
  SheetGlobalStatic,
  IBSheetCreateOptions,
  IBSheetInstance
} from './interface'
import { getIBSheetStatic } from './utils'

/**
 * @hidden
 */
class IBSheetGlobal implements SheetGlobalStatic {
  constructor() {
    return this
  }
  private get _global(): SheetGlobalStatic {
    return getIBSheetStatic()
  }
  async create(options: IBSheetCreateOptions): Promise<IBSheetInstance> {
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

/**
 * @hidden
 */
export const IBSheet = new IBSheetGlobal()
