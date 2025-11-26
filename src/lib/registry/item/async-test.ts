import { get } from '../../shared/lodash'
import {
  LOAD_TEST_RETRY_INTERVAL,
  LOAD_TEST_RETRY_MAX_COUNT,
} from '../../config'
import { ValidatableItem } from './interface'

/** @ignore */
export function asyncItemTest(
  this: ValidatableItem,
  options?: any,
): Promise<ValidatableItem> {
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
      if (nCount >= MAX_RETRY) {
        clearInterval(testInterval)
        return reject(`maximum retry attempts reached: ${MAX_RETRY}`)
      }

      if (this.test()) {
        // ✅ 직접 this 사용
        clearInterval(testInterval)
        return resolve(this)
      }

      if (debug) {
        console.warn(
          `"${this.alias}" load delayed (${nCount * INTERVAL_TIME}ms)`,
        )
      }

      nCount += 1
    }, INTERVAL_TIME)
  })
}
