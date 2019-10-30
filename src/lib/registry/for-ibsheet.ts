import { get, isNil, castArray, isEmpty, remove } from '../shared/lodash'
import { basename, isFilePath } from '../shared/str-utils'
import { IBSHEET_GLOBAL } from '../constant'
import {
  existsIBSheetStatic,
  destroyIBSheetStatic,
  setIBSheetLicense
} from '../ibsheet'
import {
  RegistryItem,
  RegistryItemURL,
  RegItemUrlData,
  RegistryItemData,
  RegItemEventName
} from './item'
import {
  castRegistryItemData,
  pushIfNotExistsUrl,
  removeByCallback
} from './utils'

/**
 * @ignore
 * @desc RegistryItem 스코프에서 IBSheet 기본 파일 추가
 */
export function defaultsIBSheetUrls(data: RegistryItemData): RegItemUrlData[] {
  let urls: any = get(data, 'urls') || []
  if (urls.length) {
    urls = urls.map((o: any) => castRegistryItemData(o))
  }

  const url = get(data, 'url')
  if (!isNil(url) && urls.length) {
    const fname = basename(url) as string
    pushIfNotExistsUrl(urls, fname)
  }

  // fixed prettier issue
  // tslint:disable-next-line:semicolon
  ;[
    { name: 'theme', def: 'default' },
    { name: 'locales', def: ['ko'] },
    { name: 'corefile', def: 'ibsheet.js' }
  ].forEach(o => {
    const { name, def } = o
    let value = get(data, name, def)
    switch (name) {
      case 'theme':
        if (!isFilePath(value, 'css')) {
          value = `css/${value}/main.css`
        }
        break
      case 'locales':
        let values = value || []
        const locale = get(data, 'locale', 'ko')
        if (!values.length) {
          values = [locale]
        }
        values.forEach((val: string) => {
          if (!isFilePath(val, 'js')) {
            val = `locale/${val}.js`
          }
          pushIfNotExistsUrl(urls, val)
        })
        return
    }
    pushIfNotExistsUrl(urls, value)
  })

  const plugins = get(data, 'plugins')
  if (!isEmpty(plugins)) {
    castArray(plugins).forEach(plugin => {
      switch (plugin) {
        // case 'excel':
        // case 'common':
        // case 'dialog':
        //   plugin = `ibsheet-${plugin}.js`
        //   break
        default:
          plugin = `plugins/ibsheet-${plugin}.js`
      }
      pushIfNotExistsUrl(urls, plugin)
    })
  }

  const license = get(data, 'license')
  if (!isEmpty(license)) {
    if (
      /^https?:/.test(license) ||
      /^[./]/.test(license) ||
      /.*\.js$/.test(license)
    ) {
      urls.push(license)
    } else {
      setIBSheetLicense(license)
    }
  }
  return urls
}

/**
 * @ignore
 * @todo 리팩토링 with [[defaultsIBSheetUrls]]
 */
export function updateIBSheetUrls(
  originUrls: RegistryItemURL[],
  data: RegistryItemData
): RegItemUrlData[] {
  let urls: any = get(data, 'urls') || []
  const origins = originUrls.slice().map(o => o.value)
  if (urls.length) {
    urls = urls.map((o: any) => castRegistryItemData(o))
  }

  const url = get(data, 'url')
  if (!isNil(url) && urls.length) {
    const fname = basename(url) as string
    pushIfNotExistsUrl(urls, fname)
  }

  // fixed prettier issue
  // tslint:disable-next-line:semicolon
  ;[
    { name: 'theme', def: null },
    { name: 'locales', def: null }
    // { name: 'corefile', def: 'ibsheet.js' }
  ].forEach(o => {
    const { name } = o
    let value = get(data, name)
    switch (name) {
      case 'theme':
        if (isNil(value)) return
        if (!isFilePath(value, 'css')) {
          value = `css/${value}/main.css`
        }
        const exists = removeByCallback(origins, str => {
          return /.*css\/.*\/main\.css/.test(str)
        })
        if (exists) return
        urls.push(value)
        return
      case 'locales':
        let values = value || []
        const locale = get(data, 'locale')
        if (!values.length) {
          values = [locale]
        }
        if (!values.length) return
        const updateLocales = values
          .map((val: any) => {
            if (!isFilePath(val, 'js')) {
              val = `locale/${val}.js`
            }
            const exists = removeByCallback(origins, str => {
              return str.indexOf(val) >= 0
            })
            if (exists) return
            urls.push(val)
            return val
          })
          .filter(Boolean)
        if (updateLocales.length) {
          remove(origins, str => /locale\/[^/]+\.js$/i.test(str))
        }
        return
      // no support change "corefile"
      default:
        return
    }
  })

  let plugins = get(data, 'plugins')
  if (!isEmpty(plugins)) {
    castArray(plugins).forEach(plugin => {
      switch (plugin) {
        // case 'excel':
        // case 'common':
        // case 'dialog':
        //   plugin = `ibsheet-${plugin}.js`
        //   break
        default:
          plugin = `plugins/ibsheet-${plugin}.js`
      }
      const exists = removeByCallback(origins, val => {
        return val.indexOf(plugin) >= 0
      })
      if (exists) return
      urls.push(plugin)
    })
  }

  // no support "license" update
  return urls.concat(origins)
}

/**
 * @ignore
 * @desc LoaderRegistry 스코프에서 IBSheet 기본 이벤트 추가
 */
export function defaultsIBSheetEvents(item: RegistryItem): void {
  const CustomGlobalName = this.getUberOption('globals.ibsheet', IBSHEET_GLOBAL)
  ;[
    {
      name: RegItemEventName.VALIDATE,
      callback: function() {
        return existsIBSheetStatic(CustomGlobalName)
      }
    },
    {
      name: RegItemEventName.UNLOAD,
      callback: function() {
        if (this.debug) {
          console.log(
            `%c[${this.name}.unload / custom] ${this.alias}`,
            'color:royalblue'
          )
        }
        destroyIBSheetStatic(CustomGlobalName)
      }
    }
  ].forEach(data => {
    const { name, callback } = data
    if (!item.hasEventOption(name)) {
      item.setEventOption(name, callback)
    }
  })
}
