// webpack.dev.cjs
const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');
const { join } = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map', // 디버깅용 소스맵
  output: {
    path: join(__dirname, 'dist/umd'),
    filename: 'ibsheet-loader.js',
    library: {
      name: 'IBSheetLoader',
      type: 'umd',
      export: 'default',
    },
  },
  devServer: {
    static: [
      // directory: join(__dirname, 'dist/umd'),
      //directory: join(__dirname, 'public'),
      {
        directory: join(__dirname, 'public'),
      },
      {
        directory: join(__dirname, 'dist/umd'), // 빌드된 파일 제공
        publicPath: '/',
      }
    ],
    devMiddleware: {
      writeToDisk: true, // 메모리가 아닌 디스크에 파일 작성
    },
    port: 3033,
    hot: true,
    open: true,
    // open: false,
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
