import { isNil } from '../shared/lodash'
import { appendJs, appendCss } from '../shared/dom-utils'
import { LoaderRegistryItem, RegistryItemURL } from '../registry'

export function asyncImportItemUrls(
  rItem: LoaderRegistryItem
): Promise<RegistryItemURL[]> {
  const { urls } = rItem
  const tasks: Promise<RegistryItemURL>[] = urls.map(
    (uItem: RegistryItemURL) => {
      return new Promise((resolve, reject) => {
        const { value: url, id, target, type } = uItem
        const elemData = { id, url, target }
        let isSuccess = false
        let errMsg = null
        switch (type) {
          case 'css':
            isSuccess = appendCss(elemData)
            break
          case 'js':
            isSuccess = appendJs(elemData)
            break
          default:
            // nothing
            errMsg = `[${rItem.alias}] not supported import type: ${type}`
        }
        if (isNil(errMsg) && !isSuccess) {
          errMsg = `[${rItem.alias}] failed to create element in document`
        }
        if (!isNil(errMsg)) {
          if (this.debug) {
            console.warn(errMsg)
          }
          reject({ message: errMsg })
        }
        resolve(uItem)
      })
    }
  )
  return Promise.all(tasks)
}
