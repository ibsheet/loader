// webpack.prod.cjs
const { BannerPlugin } = require('webpack')
const { merge } = require('webpack-merge')
const { resolve: pathResolve } = require('path')
const { multibanner } = require('bannerjs')
const { remove, pick, get, unset } = require('lodash')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const common = require('./webpack.common.cjs')
const pkg = require('./package.json')

const BUILD_TARGET = get(process.env, 'BUILD_TARGET', 'esm')
const { filename: OUTPUT_FILE } = get(pkg, 'jslib')

const banner = multibanner(
  pick(pkg, ['author', 'name', 'license', 'version', 'description', 'homepage'])
)

const prodConfig = {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new BannerPlugin({
      raw: true,
      banner,
    }),
  ],
}

function generateOutput(target) {
  let libraryTarget
  switch (target) {
    case 'esm':
      libraryTarget = 'commonjs-module'
      // libraryTarget = 'commonjs2'
      break
    case 'cjs':
      libraryTarget = 'commonjs2'
      break
    case 'umd':
      libraryTarget = 'umd'
      break
    default:
      libraryTarget = 'umd'
      break;
  }
  return {
    libraryTarget: libraryTarget,
    path: pathResolve(__dirname, `./dist/${target}`),
  }
}

function generateConfig (name) {
  const config = merge(common, prodConfig)
  const { output, optimization, plugins } = config
  const { path, libraryTarget } = generateOutput(BUILD_TARGET)
  const uglify = name.indexOf('min') > -1
  output.path = uglify ? path.replace('.min', '') : path
  output.libraryTarget = libraryTarget
  optimization.minimize = uglify
  if (uglify) {
    optimization.minimizer = [
      new TerserPlugin({
        extractComments: false // 👈 LICENSE.txt 파일 생성 방지
      })
    ]
    // if (config.entry && config.entry.sample) {
    //   delete config.entry.sample
    // }
    output.filename = `${OUTPUT_FILE}.min.js`
    remove(plugins, p => p instanceof HtmlWebpackPlugin)
  }
  return config
}

let buildJobs
switch (BUILD_TARGET) {
  
  // case 'esm':
  // case 'cjs':
    // buildJobs = [BUILD_TARGET]
    // break
  // case 'umd':
  //   buildJobs = [BUILD_TARGET, `${BUILD_TARGET}.min`]
  //   break
  default:
    buildJobs = [BUILD_TARGET]
    break
}

module.exports = buildJobs.map((name) => generateConfig(name))