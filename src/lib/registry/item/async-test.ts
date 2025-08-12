import { get } from '../../shared/lodash'
import {
  LOAD_TEST_RETRY_INTERVAL,
  LOAD_TEST_RETRY_MAX_COUNT,
} from '../../config'
import { ValidatableItem } from './interface'

/** @ignore */
export function asyncItemTest(options?: any): Promise<ValidatableItem> {
  const self: ValidatableItem = this
  const debug = get(options, 'debug', false)
  const MAX_RETRY = get(options, 'retry.maxCount', LOAD_TEST_RETRY_MAX_COUNT)
  const INTERVAL_TIME = get(
    options,
    'retry.intervalTime',
    LOAD_TEST_RETRY_INTERVAL,
  )
  return new Promise((resolve, reject) => {
    let nCount = 1
    const testInterval = setInterval(() => {
      // console.log(nCount, MAX_RETRY)
      if (nCount >= MAX_RETRY) {
        clearInterval(testInterval)
        return reject(`maximum retry attempts reached: ${MAX_RETRY}`)
      }
      if (self.test()) {
        clearInterval(testInterval)
        return resolve(self)
      }
      if (debug) {
        console.warn(
          `"${self.alias}" load delayed (${nCount * INTERVAL_TIME}ms)`,
        )
      }
      nCount += 1
    }, INTERVAL_TIME)
  })
}
