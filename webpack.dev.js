const merge = require('webpack-merge')
const common = require('./webpack.common')
const { join } = require('path')
// const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        loader: 'istanbul-instrumenter-loader',
        exclude: [/\/node_modules\//],
        query: {
          esModules: true
        }
      }
    ]
  },
  devtool: 'hidden-source-map',
  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    contentBase: join(__dirname, 'dist/umd'),
    // watchContentBase: true,
    // compress: true,
    port: 3033,
    inline: true,
    hot: true,
    open: false,
    watchOptions: {
      aggregateTimeout: 300 /* delay before rebuilding once the first file changed */,
      poll: 1000 /* Check for changes every second */,
      ignored: [
        'node_modules',
        'dist'
      ]
    }
  }
})
