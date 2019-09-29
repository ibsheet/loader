# ibsheet-loader

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/271223b5e7944ad4bc78cbed119924b5)](https://www.codacy.com/manual/ibsheet/loader?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ibsheet/loader&amp;utm_campaign=Badge_Grade)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Dynamically load support module of IBSheet

[![js-standard-style](https://cdn.rawgit.com/standard/standard/master/badge.svg)](http://standardjs.com)

## features

* [x] [TypeScript 3.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html)
* [x] [TSLint](https://palantir.github.io/tslint/)
* [x] [standard JS](https://standardjs.com/)
* [x] [AVA](https://github.com/avajs/ava), [nyc](https://github.com/istanbuljs/nyc)
* [x] [Webpack 4](https://webpack.js.org/)
* [x] [Standard Version](https://github.com/conventional-changelog/standard-version)

### continuous integration

* [Codacy](https://www.codacy.com) - Automated code reviews & code analytics
* [CircleCI](https://circleci.com) - Continuous Integration and Delivery
* [codecov](https://codecov.io) - leading, dedicated code coverage
* [snyk.io](https://snyk.io) - Continuously find and fix vulnerabilities for npm

## development

run webpack-dev-server `localhost:3033` 

```
yarn serve
```

### build

```
yarn build
```

### publish

```
yarn build
yarn release
npm link
npm publish --access public
```

### document

API Document: <https://ibsheet.github.io/loader/>

* generate: `yarn doc`
* publish: `yarn doc:publish`

## todo

* git integration
  * [ ] Codacy
  * [ ] CircleCI
  * [ ] codecov
  * [ ] snyk.io

## license

[MIT](./LICENSE)
