import { CustomEventEmitter } from './custom'
// import { parse as parseURL } from 'url'

import {
  get,
  has,
  isNil,
  castArray,
  isString,
  pick,
  defaultsDeep,
  bind,
  concat,
  clone,
  assignIn
} from './shared/lodash'
import { documentReady } from './shared/dom-utils'
import { IntervalManager } from './shared/interval-manager'
import { asyncRemoveIBSheetElements } from './registry/item/async-unload'
import {
  LoaderTaskManager,
  createTaskManager,
  LoaderTaskType
} from './task-man'
import { getLoadItems } from './modules'
import {
  IBSheetInstance,
  IBSheetCreateOptions,
  IBSheetGlobalStatic,
  IBSheet8GlobalInstance,
  generateSheetID,
  generateElementID
} from './ibsheet'

// import { double, power } from './number'
import { IBSHEET, APP_VERSION } from './constant'
import { LoaderConfigOptions, DefaultLoaderConfig } from './config'
import { LoaderRegistry, RegistryItem } from './registry'
import { RegisteredItem, LoaderStatus, LoaderEventName } from './interface'

/**
 * IBSheetLoaderStatic Main Class
 */
export class IBSheetLoaderStatic extends CustomEventEmitter {
  [x: string]: {}
  /** @ignore */
  private _status: LoaderStatus = LoaderStatus.PENDING
  /** @ignore */
  private _ready: boolean = false
  /** @ignore */
  private _loadTaskMan: LoaderTaskManager
  /** @ignore */
  private _unloadTaskMan: LoaderTaskManager
  /** @ignore */
  private _options: LoaderConfigOptions
  /** @ignore */
  private _ibsheet: IBSheetGlobalStatic = IBSheet8GlobalInstance

  /** @ignore */
  intervalMan: IntervalManager

  /**
   * 라이브러리 저장소
   * @see https://ibsheet.github.io/loader-manual/docs/basic/registry
   */
  registry: LoaderRegistry

  /**
   * 스크립트를 로드하면 singleton객체로 초기화되므로 단 한번만 호출됩니다.
   */
  constructor() {
    super()
    this._options = clone(DefaultLoaderConfig)
    this.registry = new LoaderRegistry(this)
    this._initTasksManagers()
    documentReady(() => {
      this._ready = true
      this._status = LoaderStatus.IDLE
    })
    return this
  }

  /** @ignore */
  get debug(): boolean {
    return this.getOption('debug', false)
  }

  /**
   * 버전정보를 반환
   */
  get version(): string {
    return APP_VERSION
  }

  /** @ignore */
  get ready(): boolean {
    return this._ready
  }
  /** @ignore */
  get status(): LoaderStatus {
    return this._status
  }
  /**
   * 현재 설정상태를 반환
   */
  get options(): LoaderConfigOptions {
    return clone(this._options)
  }
  /** @ignore */
  get loadedDefaultLib(): boolean {
    const item = this._getDefaultRegItem(false)
    if (isNil(item)) return false
    return item.loaded
  }
  /** @ignore */
  private _getDefaultRegItem(throwError: boolean = true): RegistryItem {
    const item = this.registry.findOne(IBSHEET)
    if (throwError && isNil(item)) {
      throw new Error(`not found registration data for ${IBSHEET} library`)
    }
    return item as RegistryItem
  }
  /** @ignore */
  private _initTasksManagers(): void {
    const createTaskMan = bind(createTaskManager, this)
    this._loadTaskMan = createTaskMan(LoaderTaskType.LOAD, this)
    this._unloadTaskMan = createTaskMan(LoaderTaskType.UNLOAD, this)
  }
  /**
   * 로더의 기본속성을 변경할 수 있습니다.
   * @see https://ibsheet.github.io/loader-manual/docs/basic/configuration
   */
  config(options?: LoaderConfigOptions): this {
    let loaderOpts
    if (!isNil(options)) {
      loaderOpts = pick(options, [
        'autoload',
        'debug',
        'retry',
        'globals',
        'preset'
      ])
      this._options = defaultsDeep(loaderOpts, this._options)
      const sheetGlobal = get(loaderOpts, 'globals.ibsheet')
      this._ibsheet.setGlobalName(sheetGlobal)
      const regOpts = get(options, 'registry')
      if (!isNil(regOpts)) {
        this.registry.addAll(regOpts, true)
      }
      const readyCallback = get(options, 'ready')
      if (!isNil(readyCallback)) {
        documentReady(() => readyCallback.call(this))
      }
    }
    if (this.debug) {
      this.intervalMan = new IntervalManager(window, loaderOpts)
    }
    return this
  }

  /** @ignore */
  getOption(sPath: string, def?: any): any {
    return get(this.options, sPath, def)
  }

  /**
   * 해당 라이브러리의 정보를 반환
   * @param alias 라이브러리 별칭
   * @alias [[LoaderRegistry.info]]
   */
  info(alias: string): string | undefined {
    return this.registry.info(alias)
  }

  /**
   * 등록된 라이브러리의 정보 중에서 `alias`와 `loaded`정보만을 매핑해서 번환
   */
  list(): RegisteredItem[] {
    return this.registry.list().map(alias => {
      const item = this.registry.get(alias) as RegistryItem
      return {
        alias,
        loaded: item.loaded
      }
    })
  }

  /**
   * 로드된 IBSheet 객체를 반환, 로드되지 않았다면 `undefined`
   * @see https://docs.ibleaders.com/ibsheet/v8/manual/#docs/static/static
   */
  getIBSheetStatic(): any {
    return this._ibsheet.global
  }

  // 20200402 김의연, 서득원, 이재호 - [#] load 시 ibsheet autoload 인터페이스 추가
  load(arg?: any, alsoDefaultLib?: boolean): this {
    // const registry = this.registry
    const taskMan = this._loadTaskMan
    if (isNil(alsoDefaultLib)) {
      alsoDefaultLib = this.options.autoload
    }
    const aLoadItems = getLoadItems.apply(this, [arg, alsoDefaultLib])

    // add load tasks
    const tasks = aLoadItems
      .map((item: RegistryItem) => {
        if (item.changed) {
          const alias = item.alias
          if (item.loaded) {
            this.reload(alias)
            return
          } else if (taskMan.exists(item)) {
            item.resolveUpdateUrls(() => this.reload(alias))
            return
          }
        }
        return taskMan.add(item)
      })
      .filter(Boolean)

    if (!tasks.length) {
      return this
    }
    // console.log('@@@', tasks.map((o: any) => o.alias))

    // start import library
    taskMan.start()
    return this
  }

  /**
   * 로드된 `ibsheet`라이브러리로부터 새로운 시트를 만듭니다.
   * @param options IBSheet 생성 옵션
   * @see https://ibsheet.github.io/loader-manual/docs/ibsheet/create-sheet
   * @see https://docs.ibleaders.com/ibsheet/v8/manual/#docs/static/create
   */
  createSheet(options: any): Promise<IBSheetInstance> {
    const sheetOpts: IBSheetCreateOptions = {}
    const ibsheet = this._ibsheet
    ;[
      { key: 'id' },
      { key: 'el', alias: ['elementId'] },
      { key: 'options', alias: ['config'] },
      { key: 'data' }
    ].forEach((o: any) => {
      const { key } = o
      concat(key, get(o, 'alias'))
        .filter(Boolean)
        .forEach((prop: string) => {
          if (has(options, prop)) {
            sheetOpts[key] = get(options, prop)
          }
        })
    })

    // if not defined "id"
    if (!has(sheetOpts, 'id')) {
      sheetOpts.id = generateSheetID()
    }

    // if not defined "el"
    if (!has(sheetOpts, 'el') && has(options, 'element')) {
      sheetOpts.el = ((el: HTMLElement) => {
        let sid = el.getAttribute('id')
        if (isNil(sid)) {
          sid = generateElementID()
          if (this.debug) {
            console.log('generated element id:', sid)
          }
          el.setAttribute('id', sid)
        }
        return sid
      })(get(options, 'element'))
    }
    // onRenderFirstFinish 이벤트에서 OnAfterRenderFirstFinsh 함수를 호출해 주면 then이 실행되게 하자
    const sheetRenderFirstFinish = function(
      sheet: any,
      mainResolve: Function
    ): Promise<IBSheetInstance> {
      return new Promise(resolve => {
        sheet.OnAfterRenderFirstFinish = function(callback: Function) {
          mainResolve(this)
          resolve(this)
          if (callback) callback(this)
        }
      })
    }

    // window 전역에 있는 IB_ 로 시작하는 객체를 모듈로 사용할 수 있도록 하는 기능 추가
    const setloaderPreset = function(): Promise<{}> {
      return new Promise(resolve => {
        const obj = {}
        for (let ws in window) {
          if (ws.startsWith('IB_')) {
            obj[ws] = window[ws]
          }
        }
        resolve(obj)
      })
    }

    const createFn = bind(ibsheet.create, ibsheet)
    const createEvtData = { target: ibsheet.global, data: sheetOpts }
    return new Promise(async (resolve, reject) => {
      let sheet: any

      if (this.loadedDefaultLib) {
        try {
          // window 전역에 있는 IB_ 로 시작하는 객체를 모듈로 사용할 수 있도록 하는 기능 추가
          this.loaderPreset = await setloaderPreset()
          this.emit(LoaderEventName.CREATE_SHEET, createEvtData)
          sheet = await createFn(sheetOpts)
          this.emit(LoaderEventName.CREATED_SHEET, { target: sheet })

          // ibsheet-common.js 에 CommonOptions에 Cfg:{LoaderCreateDelay:1} 가 설정되면 sheetCreate().then()의 시점을 onRenderFirstFinish() 이후로 바꾼다.

          // 단 이렇게 사용하려면 CommonOptions에 다음 부분이 추가되어야 함.
          // Event:{
          //     onRenderFirstFinish:function(){
          //         if (evt.sheet.OnAfterRenderFirstFinish) {  evt.sheet.OnAfterRenderFirstFinish(); }
          //    }
          // }
          if (sheet.LoaderCreateDelay) {
            return await sheetRenderFirstFinish(sheet, resolve)
          } else {
            return resolve(sheet)
          }
        } catch (err) {
          this.emit(
            LoaderEventName.CREATE_SHEET_FAILED,
            assignIn(createEvtData, { error: err })
          )
          return reject(err)
        }
      }
      // if not loaded
      const defItem = this._getDefaultRegItem()
      defItem.once(LoaderEventName.LOADED, async () => {
        try {
          // window 전역에 있는 IB_ 로 시작하는 객체를 모듈로 사용할 수 있도록 하는 기능 추가
          this.loaderPreset = await setloaderPreset()
          this.emit(LoaderEventName.CREATE_SHEET, createEvtData)
          sheet = await createFn(sheetOpts)
          this.emit(LoaderEventName.CREATED_SHEET, { target: sheet })
        } catch (err) {
          this.emit(
            LoaderEventName.CREATE_SHEET_FAILED,
            assignIn(createEvtData, { error: err })
          )
          reject(err)
        }
        return resolve(sheet)
      })
      try {
        // createSheet 시 IBSheet가 로드 되어있지 않은 경우 반드시 로드
        this.load('ibsheet', true)
      } catch (err) {
        this.emit(
          LoaderEventName.CREATE_SHEET_FAILED,
          assignIn(createEvtData, { error: err })
        )
        reject(err)
      }
    })
  }

  /**
   * 만들어진 `IBSheet`를 제거(dispose)합니다.
   * @param sid 제거할 시트 아이디
   * @see https://ibsheet.github.io/loader-manual/docs/ibsheet/remove-sheet
   * @see https://docs.ibleaders.com/ibsheet/v8/manual/#docs/funcs/dispose
   */
  removeSheet(sid: string): void {
    if (!this.loadedDefaultLib) return
    const ibsheetStatic = this.getIBSheetStatic()
    const target = ibsheetStatic[sid]
    if (isNil(target)) {
      if (this.debug) {
        console.warn('not found target sheet:', sid)
      }
      return
    }
    this.emit(LoaderEventName.REMOVE_SHEET, { target })
    try {
      target.dispose()
      asyncRemoveIBSheetElements(this.options, true)
      setTimeout(() => {
        this.emit(LoaderEventName.REMOVED_SHEET, {
          target: ibsheetStatic,
          data: { id: sid }
        })
      }, 10)
    } catch (err) {
      console.error(err)
      this.emit(LoaderEventName.REMOVE_SHEET_FAILED, {
        target: ibsheetStatic,
        error: err
      })
    }
  }

  sheetReady(callback?: (ibsheet?: any) => void): any {
    if (this.loadedDefaultLib) {
      return Promise.resolve(this.getIBSheetStatic())
    }
    return new Promise((resolve, reject) => {
      try {
        const defItem = this._getDefaultRegItem()
        defItem.once(LoaderEventName.LOADED, () => {
          const ibsheetStatic = this.getIBSheetStatic()
          try {
            if (!isNil(callback)) {
              callback.call(ibsheetStatic, ibsheetStatic)
            }
            resolve(ibsheetStatic)
          } catch (err) {
            reject(err)
          }
        })
        this.load()
      } catch (err) {
        reject(err)
      }
    }).catch(err => {
      throw new Error(err)
    })
  }

  /** @ignore */
  reload(arg?: string | string[]): this {
    const self = this
    if (isNil(arg)) {
      const item = this._getDefaultRegItem(false)
      if (isNil(item)) return this
      arg = item.alias
    }
    castArray(arg).forEach(alias => {
      const item = this.registry.findOne(alias)
      if (isNil(item)) {
        if (this.debug) {
          console.warn(`not found item: ${alias}`)
        }
        return
      }
      if (item.loaded) {
        item.once(LoaderEventName.UNLOADED, evt => {
          const target = evt.target
          const tAlias = target.alias
          if (this.debug) {
            console.log(
              `%c[IBSheetLoader] reload start - ${tAlias}`,
              'background-color:green;color:white'
            )
          }
          self.load(tAlias, false)
        })
        this.unload(alias)
        return
      }
      this.load(alias, false)
    })
    return this
  }

  /**
   * 요청한 목록의 라이브러리를 `DOM`에서 제거합니다.
   * @param params 제거할 라이브러리의 `name` 또는 `alias` 목록
   */
  unload(params?: string | string[]): this {
    const registry = this.registry
    const taskMan = this._unloadTaskMan

    // unload default library
    const sheetLib = this._getDefaultRegItem()
    const { alias: defaultAlias } = sheetLib.raw
    if (sheetLib.loaded && !taskMan.exists(sheetLib) && isNil(params)) {
      params = [defaultAlias]
    }

    // no action
    if (isNil(params)) {
      return this
    }

    // add load tasks
    const tasks = castArray(params)
      .map(data => {
        let item: any
        if (isString(data)) {
          item = registry.get(data)
        }
        // todo: support json type
        if (isNil(item)) {
          console.warn(`invalid paramater: ${data}`)
          return
        }

        if (!item.loaded) {
          if (this.debug) {
            console.warn(`already unloaded library: ${item.alias}`)
          }
          return
        }

        return taskMan.add(item)
      })
      .filter(Boolean)

    if (!tasks.length) {
      return this
    }
    // console.log('@@@ unload', tasks.map((o: any) => o.alias))

    // start remove library
    taskMan.start()
    return this
  }

  /** @ignore */
  reset(): this {
    return this
  }
  // abstract test prototype
  // double: (value: number) => number
  // power: (base: number, exponent: number) => number
}
