import { get, isNil, 
  isEmpty, 
} from '../shared/lodash'
import { basename, 
} from '../shared/str-utils'
import {
  setIBChartLicense,
} from '../ibchart'
import {
  RegistryItemURL,
  RegItemUrlData,
  RegistryItemData,
} from './item'
import {
  castRegistryItemData,
  pushIfNotExistsUrl,
} from './utils'

export function defaultsIBChartUrls(data: RegistryItemData): RegItemUrlData[] {
  try {
    let urls: any = get(data, 'urls') || []
    if (urls.length) {
      urls = urls.map((o: any) => castRegistryItemData(o))
    }
  
    const url = get(data, 'url')
    if (!isNil(url) && urls.length) {
      const fname = basename(url) as string
      pushIfNotExistsUrl(urls, fname)
    }
  
    let chart = `ibchart.js`
    pushIfNotExistsUrl(urls, chart)
  
    let chartinfo = `ibchartinfo.js`
    pushIfNotExistsUrl(urls, chartinfo)
  
    // dependentUrls 처리
    const dependentUrls = get(data, 'dependentUrls')
    if (!isNil(dependentUrls) && Array.isArray(dependentUrls)) {
      dependentUrls.forEach((depUrl: string) => {
        pushIfNotExistsUrl(urls, depUrl)
      })
    }
  
    const license = get(data, 'license')
    if (!isEmpty(license) && typeof license === 'string') {
      if (
        /^https?:/.test(license) ||
        /^[./]/.test(license) ||
        /.*\.js$/.test(license)
      ) {
        urls.push(license)
      } else {
        setIBChartLicense(license)
      }
    }

    return urls
  } catch (error) {
    console.error('Error in defaultsIBChartUrls:', error);
    throw error;
  }
}

export function updateIBChartUrls(
  originUrls: RegistryItemURL[],
  data: RegistryItemData,
): RegItemUrlData[] {
  let urls: any = get(data, 'urls') || []
  const origins = originUrls.slice().map((o) => o.value)
  if (urls.length) {
    urls = urls.map((o: any) => castRegistryItemData(o))
  }

  const url = get(data, 'url')
  if (!isNil(url) && urls.length) {
    const fname = basename(url) as string
    pushIfNotExistsUrl(urls, fname)
  }

  let chart = `ibchart.js`
  pushIfNotExistsUrl(urls, chart)

  let chartinfo = `ibchartinfo.js`
  pushIfNotExistsUrl(urls, chartinfo)

  // dependentUrls 처리 추가
  const dependentUrls = get(data, 'dependentUrls')
  if (!isNil(dependentUrls) && Array.isArray(dependentUrls)) {
    dependentUrls.forEach((depUrl: string) => {
      pushIfNotExistsUrl(urls, depUrl)
    })
  }

  // no support "license" update
  return urls.concat(origins)
}
