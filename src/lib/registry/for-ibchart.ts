import { get, isNil, isEmpty } from '../shared/lodash'
import { basename } from '../shared/str-utils'
import { setIBChartLicense } from '../ibchart'
import { RegistryItemURL, RegItemUrlData, RegistryItemData } from './item'
import { castRegistryItemData, pushIfNotExistsUrl } from './utils'

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

    // dependentUrls 처리 (순차 로딩을 위해 dependencies 설정)
    // ibchart보다 먼저 로딩되어야 하므로 앞에 추가
    const dependentUrls = get(data, 'dependentUrls')
    let lastDependentBasename: string | null = null
    if (!isNil(dependentUrls) && Array.isArray(dependentUrls)) {
      let prevBasename: string | null = null
      dependentUrls.forEach((depUrl: string) => {
        const urlData: RegItemUrlData = { url: depUrl }
        if (prevBasename) {
          urlData.dependencies = [prevBasename]
        }
        // basename 추출 (확장자 제외)
        const filename = depUrl.split('/').pop() || depUrl
        const parts = filename.split('.')
        if (parts.length > 1) {
          parts.pop() // 확장자 제거
        }
        prevBasename = parts.join('.')
        lastDependentBasename = prevBasename
        urls.push(urlData)
      })
    }

    // ibchart.js는 dependentUrls의 마지막 JS 파일이 로딩된 후에 로딩되어야 함
    const chartUrlData: RegItemUrlData = { url: `ibchart.js` }
    if (lastDependentBasename) {
      chartUrlData.dependencies = [lastDependentBasename]
    }
    urls.push(chartUrlData)

    // ibchartinfo.js는 ibchart.js가 로딩된 후에 로딩되어야 함
    const chartinfoUrlData: RegItemUrlData = {
      url: `ibchartinfo.js`,
      dependencies: ['ibchart'],
    }
    urls.push(chartinfoUrlData)

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
    console.error('Error in defaultsIBChartUrls:', error)
    throw error
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

  // dependentUrls 처리 (순차 로딩을 위해 dependencies 설정)
  // ibchart보다 먼저 로딩되어야 하므로 앞에 추가
  const dependentUrls = get(data, 'dependentUrls')
  let lastDependentBasename: string | null = null
  if (!isNil(dependentUrls) && Array.isArray(dependentUrls)) {
    let prevBasename: string | null = null
    dependentUrls.forEach((depUrl: string) => {
      const urlData: RegItemUrlData = { url: depUrl }
      if (prevBasename) {
        urlData.dependencies = [prevBasename]
      }
      // basename 추출 (확장자 제외)
      const filename = depUrl.split('/').pop() || depUrl
      const parts = filename.split('.')
      if (parts.length > 1) {
        parts.pop() // 확장자 제거
      }
      prevBasename = parts.join('.')
      lastDependentBasename = prevBasename
      urls.push(urlData)
    })
  }

  // ibchart.js는 dependentUrls의 마지막 JS 파일이 로딩된 후에 로딩되어야 함
  const chartUrlData: RegItemUrlData = { url: `ibchart.js` }
  if (lastDependentBasename) {
    chartUrlData.dependencies = [lastDependentBasename]
  }
  urls.push(chartUrlData)

  // ibchartinfo.js는 ibchart.js가 로딩된 후에 로딩되어야 함
  const chartinfoUrlData: RegItemUrlData = {
    url: `ibchartinfo.js`,
    dependencies: ['ibchart'],
  }
  urls.push(chartinfoUrlData)

  // no support "license" update
  return urls.concat(origins)
}
