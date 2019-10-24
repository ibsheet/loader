const LoaderExports = require('./dist/cjs')

const loaderModules = (module.exports = LoaderExports.default)
Object.keys(LoaderExports).forEach(key => (loaderModules[key] = LoaderExports[key]))
