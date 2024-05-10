import { isString, assignIn } from '../shared/lodash'
import { EventEmitter } from 'events'

export class CustomEventEmitter extends EventEmitter {
  constructor() {
    super()
  }
  // @override
  public emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, assignIn({ type: event }, ...args))
  }
  bind(events: string | symbol, listener: (...args: any[]) => void): this {
    this.setMaxListeners(0); // 11개 이상의 이벤트 리스너 등록 시 경고창 표시 되지 않도록 이벤트 등록 제한 해제
    if (isString(events) && events.indexOf(' ') > 0) {
      events.split(' ').forEach(event => {
        this.on(event, listener)
      })
      return this
    }
    return this.on(events, listener)
  }
}
