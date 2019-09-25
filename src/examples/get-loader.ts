// tslint:disable:no-expression-statement
import get from 'lodash/get'
import assignIn from 'lodash/assignIn'
import isNil from 'lodash/isNil'

import { loaderOptions } from './loader-options'

let ibsheetLoader: any
export function getLoader(options?: any) {
  if (!isNil(ibsheetLoader)) return ibsheetLoader
  const IBSheetLoader = get(window, 'IBSheetLoader')
  ibsheetLoader = new IBSheetLoader(assignIn(loaderOptions, options))
  return ibsheetLoader
}

export default getLoader
