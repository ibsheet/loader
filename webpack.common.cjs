// webpack.common.cjs
require('dotenv').config()
const webpack = require('webpack')
const { resolve: pathResolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { get } = require('lodash')

const pkg = require('./package.json')
const { DefinePlugin } = webpack

const nodeEnv = process.env.NODE_ENV || 'development'
const isDevMode = nodeEnv === 'development'
const BUILD_TARGET = get(process.env, 'BUILD_TARGET', 'esm')

const GLOBAL_VAR_NAME = get(pkg, 'jslib.global', 'CustomLib')

function getOutputName (buildTarget) {
  let name
  switch (buildTarget) {
    case 'esm':
    case 'cjs':
      name = 'index'
      break
    default:
      name = get(pkg, 'jslib.filename', 'custom-lib')
  }
  return name
}

const OUTPUT_NAME = getOutputName(BUILD_TARGET)

const plugins = [
  new DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv)
    }
  }),
  new MiniCssExtractPlugin({
    filename: `assets/${isDevMode ? '[name].css' : '[name].[contenthash].css'}`,
    chunkFilename: `assets/${isDevMode ? '[id].css' : '[id].[contenthash].css'}`,
    ignoreOrder: false
  })
]

function getTsLoaderOptions (buildTarget) {
  let configFile
  switch (buildTarget) {
    case 'esm':
      configFile = !isDevMode ? 'tsconfig_esm.prod.json' : 'tsconfig_esm.dev.json';
      break
    case 'cjs':
      configFile = !isDevMode ? 'tsconfig_cjs.prod.json' : 'tsconfig_cjs.dev.json';
      break
    default:
      configFile = !isDevMode ? 'tsconfig.prod.json' : 'tsconfig.dev.json'
      break
  }
  return {
    configFile,
    transpileOnly: isDevMode
  }
}

const rules = [
  {
    enforce: 'pre',
    test: /constant\.tsx?$/,
    loader: 'string-replace-loader',
    options: {
      multiple: [
        {
          search: '##APP_VERSION##',
          replace: pkg.version
        },
        {
          search: '##APP_GLOBAL##',
          replace: GLOBAL_VAR_NAME
        },
        {
          search: '<IBSHEET_BASE_URL>',
          replace: process.env.IBSHEET_BASE_URL || ''
        }
      ]
    }
  },
  {
    enforce: 'pre',
    test: /\.tsx?$/,
    exclude: [/\/node_modules\//],
    use: [
      {
        loader: 'babel-loader'
      },
      {
        loader: 'ts-loader',
        options: getTsLoaderOptions(BUILD_TARGET)
      },
      'source-map-loader'
    ]
  },
  { test: /\.html$/, loader: 'html-loader' },
  { test: /\.hbs$/, loader: 'handlebars-loader' },
  {
    test: /\.(sa|sc|c)ss$/,
    use: [
      MiniCssExtractPlugin.loader,  // options 없이 사용
      'css-loader',
      'sass-loader'
    ]
  }
]

const config = {
  context: pathResolve(__dirname, './src'),
  entry: {
    [OUTPUT_NAME]: './index.ts',
    // sample: './sample.ts'
  },
  output: {
    path: pathResolve(__dirname, './dist/umd'),
    filename: '[name].js',
    clean: false,
  },
  module: {
    rules: rules.filter(Boolean)
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      'node_modules'
    ],
    alias: {
      '@lib': pathResolve(__dirname, 'dist/lib'), // 예시
    },
  },
  plugins,
  optimization: {
    minimize: !isDevMode
  }
}

module.exports = config
