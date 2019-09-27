import { LoaderEvent, LoaderStatus } from '../interface'
import { LoaderTaskType } from './interface'

import { LoaderTaskManager } from './task-manager'

/**
 * @hidden
 * @param taskMan
 * @param eventList
 */
export function bindTaskManEvents(
  taskMan: LoaderTaskManager,
  eventList: LoaderEvent[]
): void {
  eventList.forEach(event => {
    taskMan.on(event, evt => {
      switch (evt.type) {
        case LoaderEvent.LOAD:
        case LoaderEvent.UNLOAD:
          this._status = LoaderStatus.WORKING
          break
        case LoaderEvent.LOAD_COMPLETE:
        case LoaderEvent.UNLOAD_COMPLETE:
          this._status = LoaderStatus.IDLE
          break
      }
      this.emit(event, evt)
    })
  })
}

/** @hidden */
export function isStartEvent(event: LoaderEvent): boolean {
  let bool = false
  switch (event) {
    case LoaderEvent.LOAD:
    case LoaderEvent.UNLOAD:
      bool = true
      break
  }
  return bool
}

/** @hidden */
export function isResolveTaskEvent(event: LoaderEvent): boolean {
  let bool = true
  switch (event) {
    case LoaderEvent.LOAD:
    case LoaderEvent.UNLOAD:
      bool = false
      break
  }
  return bool
}

/**
 * @hidden
 */
export function getTaskEventsByType(type: LoaderTaskType): LoaderEvent[] {
  return type === LoaderTaskType.LOAD
    ? [
        LoaderEvent.LOAD,
        LoaderEvent.LOADED,
        LoaderEvent.LOAD_REJECT,
        LoaderEvent.LOAD_FAILED,
        LoaderEvent.LOAD_COMPLETE
      ]
    : [
        LoaderEvent.UNLOAD,
        LoaderEvent.UNLOADED,
        LoaderEvent.UNLOAD_REJECT,
        LoaderEvent.UNLOAD_FAILED,
        LoaderEvent.UNLOAD_COMPLETE
      ]
}

/**
 * @hidden
 * @param type
 */
export function createTaskManager(
  type: LoaderTaskType,
  options?: any
): LoaderTaskManager {
  const taskMan = new LoaderTaskManager(type, options)
  const events = getTaskEventsByType(type)
  bindTaskManEvents.apply(this, [taskMan, events])
  return taskMan
}
