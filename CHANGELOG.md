# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.1.5](https://github.com/ibsheet/loader/compare/v1.1.4...v1.1.5) (2020-04-02)


### Bug Fixes

* unload() 시 check박스 해제하도록 변경, debugger 삭제 ([e9a65a6](https://github.com/ibsheet/loader/commit/e9a65a6bceb3bb2f440848ba99b1f34cd6dcfbef))

### [1.1.4](https://github.com/ibsheet/loader/compare/v1.1.3...v1.1.4) (2020-04-02)


### Features

* load 시 ibsheet autoload 인터페이스 추가 ([f47cf9f](https://github.com/ibsheet/loader/commit/f47cf9f373bca38287543f328091349672639fa5))


### Bug Fixes

* test process ([81bb39f](https://github.com/ibsheet/loader/commit/81bb39fca3d14a91967935476f1a234e3c5787eb))

### [1.1.3](https://github.com/ibsheet/loader/compare/v1.1.2...v1.1.3) (2020-04-02)

### Misc

* debug 다크테마 loaded 디버그메세지 가시성 개선

### [1.1.2](https://github.com/ibsheet/loader/compare/v1.1.1...v1.1.2) (2020-02-21)


### Bug Fixes

* LazyLoadManager.checkLoadableItems 기능 오류 수정 ([4a95079](https://github.com/ibsheet/loader/commit/4a95079))

### [1.1.1](https://github.com/ibsheet/loader/compare/v1.1.0...v1.1.1) (2020-02-21)


### Features

* ibsheet-excel 플러그인 검증 로직 개선 ([5a150dd](https://github.com/ibsheet/loader/commit/5a150dd))

## [1.1.0](https://github.com/ibsheet/loader/compare/v1.0.12...v1.1.0) (2020-02-21)


### Bug Fixes

* IBSheet8 전용 plugins 자바스크립트의 로드 오류 해결 ([a609aa4](https://github.com/ibsheet/loader/commit/a609aa4))
* lint ([93cc418](https://github.com/ibsheet/loader/commit/93cc418))
* 로드 실패시 setInterval 제거 ([cdc41fe](https://github.com/ibsheet/loader/commit/cdc41fe))


### Features

* registry.getAll 기능 개선, 인자 없이 호출가능(모든 레지스트리 아이템을 반환) ([561aed9](https://github.com/ibsheet/loader/commit/561aed9))
* 레지스트리 이벤트 객체 인터페이스 개선 ([ffdd018](https://github.com/ibsheet/loader/commit/ffdd018))

### [1.0.12](https://github.com/ibsheet/loader/compare/v1.0.11...v1.0.12) (2020-02-20)


### Bug Fixes

* load시 Array<string>타입 오류 해결 ([4a473d0](https://github.com/ibsheet/loader/commit/4a473d0))

### [1.0.11](https://github.com/ibsheet/loader/compare/v1.0.10...v1.0.11) (2020-02-19)

### Features

* disposeAll 호출시 인자 사용하도록 수정

### [1.0.10](https://github.com/ibsheet/loader/compare/v1.0.9...v1.0.10) (2020-02-14)

### Misc

* update readme.md

### [1.0.9](https://github.com/ibsheet/loader/compare/v1.0.8...v1.0.9) (2020-02-14)

* deprecated

### [1.0.8](https://github.com/ibsheet/loader/compare/v1.0.7...v1.0.8) (2019-12-02)

### Bug Fixes

* fixed - 자동생성 아이디의 특수문자(`$`) 치환 (jquery 사용시 오류)

### [1.0.7](https://github.com/ibsheet/loader/compare/v1.0.6...v1.0.7) (2019-11-21)

### Bug Fixes

* createSheet - remove generated elementId log ([3d9f199](https://github.com/ibsheet/loader/commit/3d9f199))

### [1.0.6](https://github.com/ibsheet/loader/compare/v1.0.5...v1.0.6) (2019-11-04)


### Features

* **enhancement:** enhancement generate unique id logic for createSheet ([a65d397](https://github.com/ibsheet/loader/commit/a65d397))

### [1.0.5](https://github.com/ibsheet/loader/compare/v1.0.4...v1.0.5) (2019-11-04)


### Features

* **enhancement:** enhancement createSheet no longer required `id` and `el` properties ([ecbb222](https://github.com/ibsheet/loader/commit/ecbb222))

### [1.0.4](https://github.com/ibsheet/loader/compare/v1.0.3...v1.0.4) (2019-10-30)


### Bug Fixes

* fixed ibsheet plugins path ([6fbd51b](https://github.com/ibsheet/loader/commit/6fbd51b))
* fixed load, unload failed event object ([783d270](https://github.com/ibsheet/loader/commit/783d270))
* fixed update ibsheet theme process ([5b21b13](https://github.com/ibsheet/loader/commit/5b21b13))

### [1.0.3](https://github.com/ibsheet/loader/compare/v1.0.2...v1.0.3) (2019-10-27)


### Bug Fixes

* angular type definition errors ([286f73f](https://github.com/ibsheet/loader/commit/286f73f))

### [1.0.2](https://github.com/ibsheet/loader/compare/v1.0.1...v1.0.2) (2019-10-27)


### Bug Fixes

* update ibsheet options ([e858024](https://github.com/ibsheet/loader/commit/e858024))

### [1.0.1](https://github.com/ibsheet/loader/compare/v1.0.0...v1.0.1) (2019-10-24)


### Bug Fixes

* fixed webpack-dev ([c211b67](https://github.com/ibsheet/loader/commit/c211b67))


### Features

* refactoring export main modules ([f387367](https://github.com/ibsheet/loader/commit/f387367))
* **new:** getIBSheetStatic, SheetEvents ([405cee5](https://github.com/ibsheet/loader/commit/405cee5))

## [1.0.0](https://github.com/ibsheet/loader/compare/v0.0.9...v1.0.0) (2019-10-23)


### Bug Fixes

* fixed unload ([8cf2063](https://github.com/ibsheet/loader/commit/8cf2063))


### Features

* `RegistryItem` name toLowerCase() ([be1eb6d](https://github.com/ibsheet/loader/commit/be1eb6d))
* added `setInterval` manager for debug ([911f2bf](https://github.com/ibsheet/loader/commit/911f2bf))
* added removeSheet ([8cf2063](https://github.com/ibsheet/loader/commit/8cf2063))
* change interface names ([f579500](https://github.com/ibsheet/loader/commit/f579500))
* change main export name "IBSheetLoader" ([ec17e98](https://github.com/ibsheet/loader/commit/ec17e98))
* change typedoc options ([229435a](https://github.com/ibsheet/loader/commit/229435a))
* new options for ibsheet ([e1f1281](https://github.com/ibsheet/loader/commit/e1f1281))
* refactoring export modules ([4f10e28](https://github.com/ibsheet/loader/commit/4f10e28))

### [0.0.9](https://github.com/ibsheet/loader/compare/v0.0.8...v0.0.9) (2019-09-30)


### Bug Fixes

* angular package error ([dc99d34](https://github.com/ibsheet/loader/commit/dc99d34))

### [0.0.8](https://github.com/ibsheet/loader/compare/v0.0.7...v0.0.8) (2019-09-30)


### Bug Fixes

* angular tslint errors ([51cd042](https://github.com/ibsheet/loader/commit/51cd042))

### [0.0.7](https://github.com/ibsheet/loader/compare/v0.0.6...v0.0.7) (2019-09-29)


### Bug Fixes

* errata ([c53717d](https://github.com/ibsheet/loader/commit/c53717d))

### [0.0.6](https://github.com/ibsheet/loader/compare/v0.0.5...v0.0.6) (2019-09-29)

### [0.0.5](https://github.com/ibsheet/loader/compare/v0.0.3...v0.0.5) (2019-09-29)

### [0.0.3](https://github.com/ibsheet/loader/compare/v0.0.2...v0.0.3) (2019-09-29)


### Features

* change default class ([c82765c](https://github.com/ibsheet/loader/commit/c82765c))

### [0.0.2](https://github.com/ibsheet/loader/compare/v0.0.1...v0.0.2) (2019-09-29)


### Features

* **new:** createSheet, getSheetGlobalObject handler ([ab4b263](https://github.com/ibsheet/loader/commit/ab4b263))

### 0.0.1 (2019-09-27)


### Bug Fixes

* default options ([f7875c0](https://github.com/ibsheet/loader/commit/f7875c0))
* not change item status of unload processing ([f4a7e47](https://github.com/ibsheet/loader/commit/f4a7e47))


### Features

* **enhancement:** distribute task management class ([d7c550b](https://github.com/ibsheet/loader/commit/d7c550b))
* **load:** enhancement load process ([51b9106](https://github.com/ibsheet/loader/commit/51b9106))
* **new:** bind method - multiple event binding ([4efa4db](https://github.com/ibsheet/loader/commit/4efa4db))
* **new:** new load, unload, dependentUrls registry options ([14f34c1](https://github.com/ibsheet/loader/commit/14f34c1))
* **new:** unload function ([d4650bf](https://github.com/ibsheet/loader/commit/d4650bf))
* auto reload then update registered item ([6867330](https://github.com/ibsheet/loader/commit/6867330))
* change global class to instance ([ce87412](https://github.com/ibsheet/loader/commit/ce87412))
