import {
  isString,
  assignIn
} from '../shared/lodash'
import { EventEmitter } from 'events';

export class CustomEventEmitter extends EventEmitter {
  constructor() {
    super()
  }
  // @override
  public emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, assignIn({ type: event }, ...args))
  }
  bind(events: string | symbol, listener: (...args: any[]) => void): this {
    if (isString(events) && events.indexOf(' ') > 0) {
      events.split(' ').forEach(event => {
        this.on(event, listener)
      })
      return this
    }
    return this.on(events, listener)
  }
}
