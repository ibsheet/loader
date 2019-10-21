import {
  isNil,
  get,
  castArray,
  concat,
  findIndex,
  includes
} from '../../shared/lodash'
import { removeElemById, getElementsByTagName } from '../../shared/dom-utils'
import { IBSHEET } from '../../constant'
// import { RegistryItem } from './item'
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

export function asyncRemoveIBSheetElements(options?: any, onlySheet: boolean = false): Promise<any>[] {
  const isDebugMode = get(options, 'debug', false)
  let xPathList = [
    'HEAD>DIV[id^=IBFastColumns]',
    'HEAD>DIV[id^=IBOverflowColumns]'
  ]
  if (!onlySheet) {
    xPathList = xPathList.concat([
      'BODY>.SheetMain.IBMain',
      'BODY>#IBSheetControlsSheetMain'
    ])
  }

  return xPathList.map(xpath => {
    return new Promise((resolve, reject) => {
      let success = true
      let elems: any
      try {
        elems = document.querySelectorAll(xpath) || []
        if (elems.length) {
          elems.forEach((el: any) => {
            const parent = el.parentElement as HTMLElement
            parent.removeChild(el)
          })
        } else {
          success = false
        }
      } catch (err) {
        success = false
        reject(err)
      }
      if (isDebugMode && success) {
        console.log('# remove element:', xpath, '--', success)
      }
      resolve(elems)
    })
  })
}

export function asyncRemoveItemUrls(options?: any): Promise<any[]> {
  const urls = this.urls
  const isDebugMode = get(options, 'debug', false)

  let removeOptionElements: Promise<any>[] = []
  if (this.name === IBSHEET) {
    removeOptionElements = asyncRemoveIBSheetElements(options)
  }

  const removeUrlTasks1 = urls.map((uItem: RegistryItemURL) => {
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

  const removeUrlTasks2 = asyncRemoveDepndentUrls.call(this, options) || []
  const tasks: Promise<any>[] = concat(
    removeOptionElements,
    removeUrlTasks1,
    removeUrlTasks2
  )
  return Promise.all(tasks)
}
