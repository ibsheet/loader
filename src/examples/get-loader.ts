// tslint:disable:no-expression-statement
import get from 'lodash/get'
import assignIn from 'lodash/assignIn'

import { loaderOptions } from './loader-options'

export function getLoader(options?: any) {
  const IBSheetLoader = get(window, 'IBSheetLoader')
  return new IBSheetLoader(assignIn(loaderOptions, options))
}

export default getLoader
