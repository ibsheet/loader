import {
  isNil,
  get,
  castArray,
  concat,
  findIndex,
  includes
} from '../../shared/lodash'
import { removeElemById, getElementsByTagName } from '../../shared/dom-utils'
// import { LoaderRegistryItem } from './item'
import { RegistryItemURL } from './url'

export function asyncRemoveDepndentUrls(
  options?: any
): Promise<any>[] | undefined {
  const dependentUrls = this.getEventOption('dependentUrls')
  const isDebugMode = get(options, 'debug', false)
  if (isNil(dependentUrls)) return
  const allScriptEls = getElementsByTagName('script')
  const allLinkEls = getElementsByTagName('link')
  return castArray(dependentUrls).map(sUrl => {
    return new Promise((resolve, reject) => {
      const type = sUrl.indexOf('.css') > 0 ? 'css' : 'js'
      const bScript = type === 'js'
      const attrName = bScript ? 'src' : 'href'
      const targetList: any = bScript ? allScriptEls : allLinkEls
      const ndx = findIndex(targetList, (elem: any) => {
        return includes(elem[attrName], sUrl)
      })
      let errMsg
      if (ndx >= 0) {
        try {
          const el = targetList.splice(ndx, 1)[0]
          el.parentElement.removeChild(el)
        } catch (err) {
          errMsg = get(
            err,
            'message',
            `remove dependent url element error: ${sUrl}`
          )
        }
      } else {
        errMsg = `not found dependent url element: ${sUrl}`
      }
      if (!isNil(errMsg)) {
        if (isDebugMode) {
          console.warn(errMsg)
        }
        reject({ message: errMsg })
      }
      resolve(sUrl)
    })
  })
}

export function asyncRemoveItemUrls(options?: any): Promise<any[]> {
  const urls = this.urls
  const isDebugMode = get(options, 'debug', false)
  let tasks: Promise<any>[] = urls.map((uItem: RegistryItemURL) => {
    return new Promise((resolve, reject) => {
      const { value: url, id } = uItem
      let errMsg
      const el = removeElemById(id)
      const isSuccess = !isNil(el)
      if (!isSuccess) {
        errMsg = `[${url}] failed to remove element in document`
      }
      if (!isNil(errMsg)) {
        if (isDebugMode) {
          console.warn(errMsg)
        }
        reject({ message: errMsg })
      }
      resolve(uItem)
    })
  })
  const subTasks = asyncRemoveDepndentUrls.call(this, options)
  if (!isNil(subTasks)) {
    tasks = concat(tasks, subTasks)
  }
  return Promise.all(tasks)
}
