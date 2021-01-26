import { has, set } from './lib/shared/lodash'
import { APP_GLOBAL } from './lib/constant'
import { IBSheetLoaderStatic } from './lib/main'

import setPolyfill from './lib/polyfill'

setPolyfill();

/**
 * 로더 인스턴스
 */
export const IBSheetLoader = new IBSheetLoaderStatic()

// set global variable
if (!has(window, APP_GLOBAL)) {
  set(window, APP_GLOBAL, IBSheetLoader)
}
