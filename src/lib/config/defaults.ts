import { LOAD_TEST_RETRY_MAX_COUNT, LOAD_TEST_RETRY_INTERVAL } from './validate'
import { LoaderConfigOptions } from './interface'

/** @ignore */
const retry = {
  maxCount: LOAD_TEST_RETRY_MAX_COUNT,
  intervalTime: LOAD_TEST_RETRY_INTERVAL
}

/**
 * @ignore
 * 20200402 김의연, 서득원, 이재호 - [#] load 시 ibsheet autoload 인터페이스 추가
 */
export const DefaultLoaderConfig: LoaderConfigOptions = {
  debug: false,
  retry,
  autoload: true
}

export default DefaultLoaderConfig
