import { isNil, get } from '../../shared/lodash'
import { appendJs, appendCss } from '../../shared/dom-utils'
import { LoaderRegistryItem } from './item'
import { RegistryItemURL } from './url'

export function asyncImportItemUrls(options?: any): Promise<RegistryItemURL[]> {
  const self: LoaderRegistryItem = this
  const urls = !this.changed ? this.urls : this.updateUrls

  const debug = get(options, 'debug', false)
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
            errMsg = `[${self.alias}] not supported import type: ${type}`
        }
        if (isNil(errMsg) && !isSuccess) {
          errMsg = `[${self.alias}] failed to create element in document`
        }
        if (!isNil(errMsg)) {
          if (debug) {
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
