/**
 * global setInterval wrapper
 */

import { get, bind, remove } from './lodash'

/** @ignore */
interface NativeFunctions {
  // https://www.w3schools.com/jsref/met_win_setinterval.asp
  setInterval: (
    callback: TimerHandler,
    timeout?: number | undefined,
    ...args: any[]
  ) => number
  clearInterval: (handle?: number | undefined) => void
}

/** @ignore */
export class IntervalManager {
  private _native: NativeFunctions
  private _store: number[] = []
  private _debug = false

  constructor(global: Window, options?: any) {
    this._debug = get(options, 'debug', false)
    this._native = {
      setInterval: global.setInterval,
      clearInterval: global.clearInterval
    }
    global.setInterval = bind(this.setInterval, this)
    global.clearInterval = bind(this.clearInterval, this)
  }
  get debug(): boolean {
    return this._debug
  }
  get length(): number {
    return this._store.length
  }
  setInterval(...args: any[]): number {
    const nid = this._native.setInterval.apply(null, [...args])
    this._store.push(nid)
    if (this.debug) {
      console.log('# setInterval id:', nid, '--', this.length)
    }
    return nid
  }
  clearInterval(handle?: number | undefined): void {
    this._native.clearInterval.call(null, handle)
    remove(this._store, n => n === handle)
    if (this.debug) {
      console.log('# clearInterval handle:', handle, '--', this.length)
    }
  }
  list(): number[] {
    return this._store
  }
}
