import set from 'lodash/set'
import clone from 'lodash/clone'
import { SheetSampleData } from './interface'
import sheet1 from './sheet-1'
import sheet2 from './sheet-2'
import sheet3 from './sheet-3'

export const IBSheetSampleData: SheetSampleData[] = [
  sheet1,
  sheet2,
  sheet3
]

export function getSheetData(ndx: number, el: HTMLElement): SheetSampleData {
  const data = clone(IBSheetSampleData[ndx])
  set(data, 'element', el)
  set(data, 'options.Events.onRenderFirstFinish', function(_evt: any) {
    const $el = $(el)
    $el.addClass('loaded')
  })
  return data
}
