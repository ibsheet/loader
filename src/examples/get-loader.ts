// tslint:disable:no-expression-statement
import get from 'lodash/get'
import isNil from 'lodash/isNil'

let ibsheetLoader: any
export function getLoaderInstance() {
  if (!isNil(ibsheetLoader)) return ibsheetLoader
  ibsheetLoader = get(window, 'IBSheetLoader')
  return ibsheetLoader
}

export default getLoaderInstance
