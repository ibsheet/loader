import { LoaderEventName, LoaderStatus } from '../interface'
import { LoaderTaskType } from './interface'

import { LoaderTaskManager } from './task-manager'

/**
 * @ignore
 * @param taskMan
 * @param eventList
 */
export function bindTaskManEvents(
  taskMan: LoaderTaskManager,
  eventList: LoaderEventName[],
): void {
  eventList.forEach((event) => {
    taskMan.on(event, (evt) => {
      switch (evt.type) {
        case LoaderEventName.LOAD:
        case LoaderEventName.UNLOAD:
          this._status = LoaderStatus.WORKING
          break
        case LoaderEventName.LOAD_COMPLETE:
        case LoaderEventName.UNLOAD_COMPLETE:
          this._status = LoaderStatus.IDLE
          break
      }
      this.emit(event, evt)
    })
  })
}

/** @ignore */
export function isStartEvent(event: LoaderEventName): boolean {
  let bool = false
  switch (event) {
    case LoaderEventName.LOAD:
    case LoaderEventName.UNLOAD:
      bool = true
      break
  }
  return bool
}

/** @ignore */
export function isResolveTaskEvent(event: LoaderEventName): boolean {
  let bool = true
  switch (event) {
    case LoaderEventName.LOAD:
    case LoaderEventName.UNLOAD:
      bool = false
      break
  }
  return bool
}

/** @ignore */
export function getTaskEventsByType(type: LoaderTaskType): LoaderEventName[] {
  return type === LoaderTaskType.LOAD
    ? [
        LoaderEventName.LOAD,
        LoaderEventName.LOADED,
        LoaderEventName.LOAD_REJECT,
        LoaderEventName.LOAD_FAILED,
        LoaderEventName.LOAD_COMPLETE,
      ]
    : [
        LoaderEventName.UNLOAD,
        LoaderEventName.UNLOADED,
        LoaderEventName.UNLOAD_REJECT,
        LoaderEventName.UNLOAD_FAILED,
        LoaderEventName.UNLOAD_COMPLETE,
      ]
}

/**
 * @ignore
 * @param type
 */
export function createTaskManager(
  type: LoaderTaskType,
  options?: any,
): LoaderTaskManager {
  const taskMan = new LoaderTaskManager(type, options)
  const events = getTaskEventsByType(type)
  bindTaskManEvents.apply(this, [taskMan, events])
  return taskMan
}
