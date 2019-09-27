import { LOAD_TEST_RETRY_MAX_COUNT, LOAD_TEST_RETRY_INTERVAL } from './validate'

const retry = {
  maxCount: LOAD_TEST_RETRY_MAX_COUNT,
  intervalTime: LOAD_TEST_RETRY_INTERVAL
}

export const DefaultLoaderConfig = {
  debug: false,
  retry
}

export default DefaultLoaderConfig
