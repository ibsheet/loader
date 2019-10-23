import { keys } from './lib/shared/lodash'
import * as LoaderExports from './lib'

const loaderModule = (module.exports = LoaderExports.default)
keys(LoaderExports).forEach(key => (loaderModule[key] = LoaderExports[key]))
