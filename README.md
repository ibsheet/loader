# ibsheet-loader

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/271223b5e7944ad4bc78cbed119924b5)](https://www.codacy.com/manual/ibsheet/loader?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ibsheet/loader&amp;utm_campaign=Badge_Grade)
[![CircleCI](https://circleci.com/gh/ibsheet/loader.svg?style=svg)](https://circleci.com/gh/ibsheet/loader)
[![npm version](https://badge.fury.io/js/%40ibsheet%2Floader.svg)](https://www.npmjs.com/package/@ibsheet/loader)
[![dependencies Status](https://david-dm.org/ibsheet/loader/status.svg)](https://david-dm.org/ibsheet/loader)
[![devDependencies Status](https://david-dm.org/ibsheet/loader/dev-status.svg)](https://david-dm.org/ibsheet/loader?type=dev)
[![vulnerabilities](https://snyk.io/test/github/ibsheet/loader/badge.svg)](https://snyk.io/test/github/ibsheet/loader)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Github Issues](https://img.shields.io/github/issues/ibsheet/loader)](https://github.com/ibsheet/loader/issues)

Dynamically load support module for [IBSheet](https://www.ibsheet.com)

[![js-standard-style](https://cdn.rawgit.com/standard/standard/master/badge.svg)](http://standardjs.com)

## features

* [x] [TypeScript 3.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html)
* [x] [TSLint](https://palantir.github.io/tslint/)
* [x] [standard JS](https://standardjs.com/)
* [x] [Webpack 4](https://webpack.js.org/)
* [x] [Standard Version](https://github.com/conventional-changelog/standard-version)
* [x] ~~[AVA](https://github.com/avajs/ava)~~
* [x] ~~[nyc](https://github.com/istanbuljs/nyc)~~

### continuous integration

* [CircleCI](https://circleci.com) - Continuous Integration and Delivery
* [snyk.io](https://snyk.io) - Continuously find and fix vulnerabilities for npm
* ~~[Codacy](https://www.codacy.com) - Automated code reviews & code analytics~~
* ~~[codecov](https://codecov.io) - leading, dedicated code coverage~~

## documents

* TypeDoc: <https://ibsheet.github.io/loader>
* Manual: <https://ibsheet.github.io/loader-manual>

## installing

Using npm:

```sh
$ npm install @ibsheet/loader
```

Using yarn:

```sh
$ yarn add @ibsheet/loader
```

Using browser:

```html
<script src="https://unpkg.com/@ibsheet/loader/dist/umd/ibsheet-loader.min.js"></script>
```

## example

### note: Browser usage (ES3, ES5)

```js
var loader = window.IBSheetLoader
loader.load({
  name: 'ibsheet',
  baseUrl: '<publicpath>/ibsheet'
}).createSheet(options)
```

### note: Node.js usage (CommonJS)

```js
var loader = require('@ibsheet/loader')
loader.load({
  name: 'ibsheet',
  baseUrl: '<publicpath>/ibsheet'
}).createSheet(options)
```

### note: ESModule usage (ES6, TypeScript)

```js
import loader from '@ibsheet/loader'
// or import { IBSheetLoader as loader } from '@ibsheet/loader'
loader.load({
  name: 'ibsheet',
  baseUrl: '<publicpath>/ibsheet'
}).createSheet(options)
```

## development

run webpack-dev-server `localhost:3033` 

```sh
yarn serve
```

### build

```sh
yarn build
```

### document

* generate: `yarn doc`
* publish: `yarn doc:publish`

## license

[MIT](./LICENSE)
