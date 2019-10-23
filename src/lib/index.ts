import { has, set } from './shared/lodash'
import { APP_GLOBAL } from './constant'
// import './extends'
import { IBSheetLoaderStatic } from './main'

export * from './interface'

export { RetryOptions } from './task-man'
export { RegistryItem, RegistryItemData, RegItemUrlData } from './registry'
export { LoaderConfigOptions } from './config'
export { IBSheetOptions } from './ibsheet'
export { IBSheetLoaderStatic }

/**
 * test prototype
 * @hidden
 */
// const fn = IBSheetLoaderStatic.prototype
// fn.double = double
// fn.power = power
export const IBSheetLoader = new IBSheetLoaderStatic()

// set global variable
if (!has(window, APP_GLOBAL)) {
  set(window, APP_GLOBAL, IBSheetLoader)
}

export default IBSheetLoader
