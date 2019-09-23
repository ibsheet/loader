import { LoaderRegistryItem } from '../registry'

export function asyncItemTest(rItem: LoaderRegistryItem): Promise<LoaderRegistryItem> {
  const MAX_RETRY = this.getOptions('retry.maxCount')
  const INTERVAL_TIME = this.getOptions('retry.intervalTime')
  return new Promise((resolve, reject) => {
    let nCount = 1
    const testInterval = setInterval(() => {
      if (nCount > MAX_RETRY) {
        return reject(`max retry: ${MAX_RETRY}`)
      }
      if (rItem.test()) {
        clearInterval(testInterval)
        return resolve(rItem)
      }
      if (this.debug) {
        console.warn(
          `"${rItem.alias}" is delayed (${nCount * INTERVAL_TIME}ms)`
        )
      }
      nCount += 1
    }, INTERVAL_TIME)
  })
}
