import { IBMAP_GLOBAL } from '../constant'
import { has, isNil } from '../shared/lodash'
import { IBMapInstance } from './interface'

import { getIBMapStatic } from './utils'

export class IBMapGlobalStatic {
  private _name: string
  constructor(name: string = IBMAP_GLOBAL) {
    //IBMapCharts
    this._name = name
  }
  get name(): string {
    return this._name
  }
  get global(): any {
    return getIBMapStatic(this.name)
  }
  setGlobalName(name: string): void {
    if (isNil(name)) return
    this._name = name
  }
  async createMap(options: any): Promise<IBMapInstance> {
    const ibmap = this.global
    if (isNil(options)) {
      throw new Error('undefined options.')
    }
    if (!has(options, 'elem')) {
      throw new Error('"elem" property is required.')
    }
    if (!has(options, 'cfg')) {
      throw new Error('"cfg" property is required.')
    }
    try {
      const map = ibmap.create(options.elem, options.cfg)
      return await map
    } catch (err) {
      throw new Error(err)
    }
  }
}

export const IBMapGlobalInstance = new IBMapGlobalStatic()
