import { IBCHART_GLOBAL } from '../constant'
import { 
  has, 
  isNil } from '../shared/lodash'
import { IBChartInstance } from './interface';

import { getIBChartStatic } from "./utils";

export class IBChartGlobalStatic {
  private _name: string;
  constructor(name: string = IBCHART_GLOBAL) {
    this._name = name;
  }
  get name(): string {
    return this._name
  }
  get global(): any {
    return getIBChartStatic(this.name)
  }
  setGlobalName(name: string): void {
    if (isNil(name)) return
    this._name = name
  }
  async create(options: any): Promise<IBChartInstance> {
    const ibchart = this.global
    if (isNil(options)) {
      throw new Error('undefined options.')
    }
    if (!has(options, 'id')) {
        throw new Error('"id" property is required.')
    }
    if (!has(options, 'cont')) {
      throw new Error('"cont" property is required.')
    }
    try {
      const chart = ibchart(options);
      //chart 내부의 highcharts객체를 clear
      chart.dispose = function(){
        if(this._getOC  &&  typeof this._getOC == "function"){
          this._getOC().destroy();
        }
      }
      return await chart;
    } catch (err) {
      throw new Error(err)
    }
  }
}

export const IBChartGlobalInstance = new IBChartGlobalStatic()