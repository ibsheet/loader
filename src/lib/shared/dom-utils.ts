import shortid from 'shortid'
import { isNil, get } from './lodash'

shortid.characters(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
)

export interface DomAppendOptions {
  id: string
  url: string
  target?: string
}

/** @ignore */
export function documentReady(callback: (evt?: Event) => void): any {
  if (document.readyState !== 'loading') {
    return callback()
  }
  document.addEventListener('DOMContentLoaded', callback)
}

/** @ignore */
export function createLinkElement(data: DomAppendOptions): HTMLLinkElement {
  const { id, url } = data
  const linkEl: HTMLLinkElement = document.createElement('link')
  ;[
    { name: 'id', value: id },
    { name: 'rel', value: 'stylesheet' },
    { name: 'type', value: 'text/css' },
    { name: 'href', value: url }
  ].forEach(attrs => {
    const { name, value } = attrs
    linkEl.setAttribute(name, value)
  })
  return linkEl
}

/** @ignore */
export function createScriptElement(data: DomAppendOptions): HTMLScriptElement {
  const { id, url } = data
  const scriptEl: HTMLScriptElement = document.createElement('script')
  ;[{ name: 'id', value: id }, { name: 'src', value: url }].forEach(attrs => {
    const { name, value } = attrs
    scriptEl.setAttribute(name, value)
  })
  return scriptEl
}

/** @ignore */
export function existsElementById(id: string): boolean {
  return !isNil(document.getElementById(id))
}

/** @ignore */
export function validUniqueElementId(value: string | null | undefined): boolean {
  if (isNil(value)) return false
  return !existsElementById(value)
}

/** @ignore */
export function genUniqueElementId(prefix: string): string {
  let sid: string
  do {
    sid = prefix + shortid.generate()
  } while (!validUniqueElementId(sid))
  return sid
}

/** @ignore */
function checkDupElements(data: DomAppendOptions): boolean {
  const { id, url } = data
  if (existsElementById(id)) {
    console.warn('[DomValidate]', `exists ${url}`)
    return true
  }
  return false
}

/** @ignore */
export function appendCss(data: DomAppendOptions): boolean {
  if (checkDupElements(data)) return false
  const el = createLinkElement(data)
  const target = get(data, 'target', 'head')
  document[target].appendChild(el)
  return true
}

/** @ignore */
export function appendJs(data: DomAppendOptions): boolean {
  if (checkDupElements(data)) return false
  const el = createScriptElement(data)
  const target = get(data, 'target', 'body')
  document[target].appendChild(el)
  return true
}

/** @ignore */
export function removeElemById(id: string): HTMLElement | undefined {
  const elem: any = document.getElementById(id)
  if (isNil(elem)) return
  elem.parentElement.removeChild(elem)
  return elem
}

/** @ignore */
export function getElementsByTagName(tagName: string): HTMLElement[] {
  const elems = document.getElementsByTagName(tagName)
  return Array.prototype.slice.call(elems, 0)
}
