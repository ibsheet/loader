require('dotenv').config()
const webpack = require('webpack')
const { resolve: pathResolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// https://webpack.js.org/plugins/mini-css-extract-plugin/
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const TerserJSPlugin = require('terser-webpack-plugin')
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { get } = require('lodash')

const pkg = require('./package.json')
const {
  DefinePlugin
  // ProvidePlugin,
} = webpack

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
  // new ProvidePlugin({
  //   $: 'jquery'
  // }),
  new DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv)
    }
  }),
  // https://github.com/jantimon/html-webpack-plugin
  new HtmlWebpackPlugin({
    title: 'IBSheetLoader Sample',
    template: 'index.hbs'
  }),
  new MiniCssExtractPlugin({
    filename: `assets/${isDevMode ? '[name].css' : '[name].[hash].css'}`,
    chunkFilename: `assets/${isDevMode ? '[id].css' : '[id].[hash].css'}`,
    ignoreOrder: false // Enable to remove warnings about conflicting order
  })
]

function getTsLoaderOptions (buildTarget) {
  const outDir = `dist/${buildTarget}`
  let declaration = true
  let target
  switch (buildTarget) {
    case 'esm':
      target = 'esnext'
      break
    case 'cjs':
      target = 'es2015'
      break
    // case 'umd':
    //   target = 'es5'
    //   break
    default:
      target = 'es5'
      declaration = false
  }
  const configFileName = !isDevMode ? 'tsconfig.prod.json' : 'tsconfig.dev.json'
  if (isDevMode) {
    return { configFileName }
  }
  return {
    configFileName,
    target,
    outDir,
    declaration
  }
}

const rules = [
  {
    enforce: 'pre',
    test: /constant\/constant\.ts/,
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
        }
      ]
    }
  },
  {
    enforce: 'pre',
    test: /examples\/constant\.ts/,
    loader: 'string-replace-loader',
    options: {
      multiple: [
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
    loaders: [
      {
        loader: 'awesome-typescript-loader',
        // https://github.com/s-panferov/awesome-typescript-loader#loader-options
        options: getTsLoaderOptions(BUILD_TARGET)
      },
      'source-map-loader'
    ]
  },
  { test: /\.html$/, loader: 'html-loader' },
  { test: /\.hbs$/, loader: 'handlebars-loader' },
  // { test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
  {
    test: /\.(sa|sc|c)ss$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          // only enable hot in development
          hmr: isDevMode
          // if hmr does not work, this is a forceful method
          // reloadAll: true
        }
      },
      'css-loader',
      // 'postcss-loader',
      'sass-loader'
    ]
  }
]

const config = {
  context: pathResolve(__dirname, './src'),
  entry: {
    [OUTPUT_NAME]: './index.ts',
    sample: './sample.ts'
  },
  output: {
    path: pathResolve(__dirname, './dist/umd'),
    // publicPath: '/',
    filename: '[name].js'
    // chunkFilename: '[id].chunk.js'
    // library: GLOBAL_VAR_NAME,
    // libraryTarget: 'umd',
    // libraryExport: OUTPUT_NAME
    // umdNamedDefine: true
    // globalObject: 'typeof self !== "undefined" ? self : this'
  },
  node: {
    process: false
  },
  module: {
    rules: rules.filter(Boolean)
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      'node_modules'
    ]
    // alias: {
    //   jquery: 'jquery/dist/jquery.slim.min.js'
    // }
  },
  plugins,
  optimization: {
    minimize: !isDevMode
    // minimizer: !isDevMode ? [
    //   new TerserJSPlugin({}),
    //   new OptimizeCSSAssetsPlugin({})
    // ] : []
    // providedExports: true,
    // splitChunks: {
    //   name: 'shared/common',
    //   chunks: 'all'
    //   // cacheGroups: {
    //   //   vendors: {
    //   //     filename: 'shared/[name].bundle.js'
    //   //   }
    //   // }
    // }
  }
}

module.exports = config
