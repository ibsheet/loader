import { isNil, get } from '../../shared/lodash'
import { appendJs, appendCss } from '../../shared/dom-utils'
import { LoaderEventName } from '../../interface'
import { RegistryItem } from './item'
import { RegistryItemURL } from './url'
import { asyncItemTest } from './async-test'
import { LazyLoadURLManager } from './lazyload-man'

const ASYNC_IMPORT_URL = '[AsnycImportURL]'

/** @ignore */
export function asyncImportURL(options?: any): Promise<RegistryItemURL> {
  const uItem: RegistryItemURL = this
  const debug = get(options, 'debug', false)
  return new Promise((resolve, reject) => {
    const { value: url, id, target, type, alias } = uItem
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
        errMsg = `[${alias}] not supported import type: ${type}`
    }

    if (isNil(errMsg) && !isSuccess) {
      errMsg = `[${alias}] failed to create element in document`
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

/**
 * @ignore
 * 특정 자바스크립트 파일에 의존적인 자바스크립트 로드를 위한 재귀함수
 */
export function asyncImportURLs(
  aItems: RegistryItemURL[],
  lazyMan: LazyLoadURLManager,
  options?: any
): Promise<RegistryItemURL>[] {
  const debug = get(options, 'debug', false)
  return aItems.map((uItem: RegistryItemURL) => {
    uItem.once(LoaderEventName.LOADED, (evt: any) => {
      const item = evt.target
      if (debug) {
        console.log(
          `%c${ASYNC_IMPORT_URL} loaded: ${item.alias}`,
          'color: black; background-color: white;'
        )
      }
      /**
       * TODO: lazyLoad 자바스크립트에 대한 피드백(?) 처리
       */
      const lazyLoadUrls = lazyMan.checkLoadableItems(item)
      if (!lazyLoadUrls.length) return
      asyncImportURLs(lazyLoadUrls, lazyMan, options)
    })
    return new Promise((resolve, reject) => {
      asyncImportURL
        .call(uItem, options)
        .then((tItem: RegistryItemURL) => {
          // console.log('* PreloadURL:', tItem.alias)
          asyncItemTest
            .call(tItem, options)
            .then((item: RegistryItemURL) => {
              item.emit(LoaderEventName.LOADED, { target: item })
              resolve(item)
            })
            .catch((message: string) => {
              reject({ message })
            })
        })
        .catch((err: any) => {
          reject(err.message)
        })
    })
  })
}

/** @ignore */
export function asyncImportItemUrls(options?: any): Promise<RegistryItemURL[]> {
  const rItem: RegistryItem = this
  const urls = !rItem.changed ? rItem.urls : rItem.updateUrls
  const debug = get(options, 'debug', false)
  const lazyMan = new LazyLoadURLManager()

  const aImportJsNames = urls
    .filter(item => item.type === 'js')
    .map(item => item.basename)

  const preloadUrls = urls.filter((item: RegistryItemURL) => {
    if (item.type !== 'js') return true
    const dependencies = item.dependencies
    const nDependLen = dependencies.length
    if (!nDependLen) return true
    // dependencies 목록에 대한 유효성 검사
    for (let i = 0; i < nDependLen; i += 1) {
      const bname = dependencies[i]
      if (!aImportJsNames.includes(bname)) {
        if (debug) {
          console.warn(
            `${ASYNC_IMPORT_URL} Invalid Dependencies: Not in import list!`
          )
        }
        return true
      }
    }
    lazyMan.add(item)
    return false
  })

  const asyncTasks: Promise<RegistryItemURL>[] = asyncImportURLs(
    preloadUrls,
    lazyMan,
    options
  )

  return Promise.all(asyncTasks)
}
