# ibsheet-loader

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/e9189f42210a489f93d5543a47dd7e27)](https://app.codacy.com/gh/ibsheet/loader/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![CircleCI](https://circleci.com/gh/ibsheet/loader.svg?style=svg)](https://circleci.com/gh/ibsheet/loader)
[![npm version](https://badge.fury.io/js/%40ibsheet%2Floader.svg)](https://www.npmjs.com/package/@ibsheet/loader)
[![vulnerabilities](https://snyk.io/test/github/ibsheet/loader/badge.svg)](https://snyk.io/test/github/ibsheet/loader)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Dynamically load support module for [IB Sheet](https://www.ibsheet.com)

[![js-standard-style](https://cdn.rawgit.com/standard/standard/master/badge.svg)](http://standardjs.com)

**@ibsheet/loader** loads the [**IBsheet 8**](https://www.ibsheet.com) data grid library into a web page on demand: the core script, CSS theme, locale files and plugins.

**@ibsheet/loader**는 웹 데이터 그리드 [**IBsheet 8**](https://www.ibsheet.com)의 스크립트 · CSS 테마 · 언어팩 · 플러그인 파일을 필요할 때 웹페이지에 불러오는 라이브러리입니다.

- IBsheet 8 homepage (제품 소개): https://www.ibsheet.com
- IBsheet 8 manual (매뉴얼): https://docs.ibsheet.com/ibsheet/v8/manual/
- MCP server for AI coding tools such as Claude Code, Cursor, GitHub Copilot, Codex CLI and Gemini CLI (AI 코딩 도구 연동): https://docs.ibsheet.com/ibsheet/v8/manual/docs/start/mcp.html

## features

* [x] [TypeScript 5.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html)
* [x] [ESLint](https://eslint.org/)
* [x] [standard JS](https://standardjs.com/)
* [x] [Webpack 5](https://webpack.js.org/)
* [x] [Standard Version](https://github.com/conventional-changelog/standard-version)
* [x] ~~[AVA](https://github.com/avajs/ava)~~
* [x] ~~[nyc](https://github.com/istanbuljs/nyc)~~

### continuous integration

* [CircleCI](https://circleci.com) - Continuous Integration and Delivery
* [snyk.io](https://snyk.io) - Continuously find and fix vulnerabilities for npm
* [Codacy](https://www.codacy.com) - Automated code reviews & code analytics
* ~~[codecov](https://codecov.io) - leading, dedicated code coverage~~

## documents

* TypeDoc: <https://ibsheet.github.io/loader>
* Manual: <https://ibsheet.github.io/loader-manual>

## installing

Using npm:

```sh
npm install @ibsheet/loader
```

Using yarn:

```sh
yarn add @ibsheet/loader
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
