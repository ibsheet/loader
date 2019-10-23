const {
  BannerPlugin,
  LoaderOptionsPlugin
} = require('webpack')
const webpackMerge = require('webpack-merge')
const { resolve: pathResolve } = require('path')
const { multibanner } = require('bannerjs')
const { remove, pick, get, unset } = require('lodash')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.common')
const pkg = require('./package.json')

const BUILD_TARGET = get(process.env, 'BUILD_TARGET', 'esm')

const {
  filename: OUTPUT_FILE
} = get(pkg, 'jslib')
const banner = multibanner(pick(pkg, [
  'author',
  'name',
  'license',
  'version',
  'description',
  'homepage'
]))

const prodConfig = {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    // https://webpack.js.org/plugins/banner-plugin/
    new BannerPlugin({
      raw: true,
      banner
    }),
    new LoaderOptionsPlugin({
      options: {
        tslint: {
          emitErrors: true,
          failOnHint: true
        }
      }
    })
  ]
}

function generateOutput (target) {
  let libraryTarget
  switch (target) {
    case 'esm':
      libraryTarget = 'commonjs-module'
      break
    case 'cjs':
      libraryTarget = 'commonjs2'
      break
    case 'umd':
      libraryTarget = 'umd'
      break
  }
  return {
    libraryTarget,
    path: pathResolve(__dirname, `./dist/${target}`)
  }
}

function generateConfig (name) {
  const config = webpackMerge(common, prodConfig)
  const { output, optimization, plugins } = config
  const { path, libraryTarget } = generateOutput(BUILD_TARGET)
  output.path = path
  output.libraryTarget = libraryTarget
  const uglify = name.indexOf('min') > -1
  optimization.minimize = uglify
  if (uglify) {
    unset(config.entry, 'sample')
    output.filename = `${OUTPUT_FILE}.min.js`
    remove(plugins, p => p instanceof HtmlWebpackPlugin)
  }
  return config
}

let buildJobs
switch (BUILD_TARGET) {
  case 'esm':
  case 'cjs':
    buildJobs = [BUILD_TARGET]
    break
  case 'umd':
    buildJobs = [
      BUILD_TARGET,
      `${BUILD_TARGET}.min`
    ]
    break
}

module.exports = buildJobs
  .map(name => generateConfig(name))
