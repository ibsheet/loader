import { get, isNil, castArray, isEmpty } from '../shared/lodash'
import { basename } from '../shared/path-utils'
import { IBSHEET_GLOBAL } from '../constant'
import {
  existsIBSheetStatic,
  destroyIBSheetStatic,
  setIBSheetLicense
} from '../ibsheet'
import { RegistryItemData, RegItemEventName } from './item/interface'
import { RegistryItem } from './item'
import { castRegistryItemData, pushIfNotExistsUrl } from './utils'

/**
 * @desc RegistryItem 스코프에서 IBSheet 기본 파일 추가
 */
export function defaultsIBSheetUrls(data: RegistryItemData): string[] {
  // const baseUrl = get(data, 'baseUrl')
  // const hasBaseUrl = !isNil(baseUrl)
  let urls: any = get(data, 'urls') || []
  if (urls.length) {
    urls = urls.map((o: any) => castRegistryItemData(o))
  }

  const url = get(data, 'url')
  if (!isNil(url) && urls.length) {
    const fname = basename(url) as string
    pushIfNotExistsUrl(urls, fname)
  }

  ;[
    { name: 'theme', def: 'default' },
    { name: 'locale', def: 'ko' },
    { name: 'corefile', def: 'ibsheet.js' }
  ].forEach(o => {
    const { name, def } = o
    let url = get(data, name, def)
    switch (name) {
      case 'theme':
        if (url.indexOf('/') < 0) {
          url = `css/${url}/main.css`
        }
        break
      case 'locale':
        if (url.indexOf('/') < 0) {
          url = `locale/${url}.js`
        }
        break
    }
    pushIfNotExistsUrl(urls, url)
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
          plugin = `ibsheet-${plugin}.js`
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
