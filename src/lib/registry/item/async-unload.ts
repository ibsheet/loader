import { isNil, get } from '../../shared/lodash'
import { removeElemById } from '../../shared/dom-utils'
import { LoaderRegistryItem } from './item'
import { RegistryItemURL } from './url'

export function asyncRemoveItemUrls(options?: any): Promise<RegistryItemURL[]> {
  const self: LoaderRegistryItem = this
  const urls = self.urls
  const debug = get(options, 'debug', false)
  const tasks: Promise<RegistryItemURL>[] = urls.map(
    (uItem: RegistryItemURL) => {
      return new Promise((resolve, reject) => {
        const { value: url, id } = uItem
        let errMsg
        const el = removeElemById(id)
        const isSuccess = !isNil(el)
        if (!isSuccess) {
          errMsg = `[${url}] failed to remove element in document`
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
