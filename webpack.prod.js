const {
  BannerPlugin,
  LoaderOptionsPlugin
} = require('webpack')
const webpackMerge = require('webpack-merge')
const common = require('./webpack.common')
const pkg = require('./package.json')
const { multibanner } = require('bannerjs')
const { remove, pick, get, unset } = require('lodash')
const HtmlWebpackPlugin = require('html-webpack-plugin')

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

function generateConfig (name) {
  const config = webpackMerge(common, prodConfig)
  const { output, optimization, plugins } = config
  const uglify = name.indexOf('min') > -1
  optimization.minimize = uglify
  if (uglify) {
    unset(config.entry, 'sample')
    output.filename = `${OUTPUT_FILE}.min.js`
    remove(plugins, p => p instanceof HtmlWebpackPlugin)
  }
  return config
}

module.exports = [
  'main',
  'main.min'
].map(name => generateConfig(name))
