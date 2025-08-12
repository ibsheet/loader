// webpack.dev.cjs
const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');
const { join } = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map', // 디버깅용 소스맵
  devServer: {
    static: {
      directory: join(__dirname, 'dist/umd'),
    },
    port: 3033,
    hot: true,
    open: false,
    watchFiles: {
      paths: ['src/**/*', 'dist/**/*'],
      options: {
        ignored: ['node_modules', 'dist'],
        aggregateTimeout: 300,
        poll: 1000
      }
    }
  }
});
