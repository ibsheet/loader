import { has, set } from './lib/shared/lodash'
import { APP_GLOBAL } from './lib/constant'
import { IBSheetLoaderStatic } from './lib/main'

export const IBSheetLoader = new IBSheetLoaderStatic()

// set global variable
if (!has(window, APP_GLOBAL)) {
  set(window, APP_GLOBAL, IBSheetLoader)
}
