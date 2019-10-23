import set from 'lodash/set'
import { SheetSampleData } from './interface'
import sheet1 from './sheet-1'
import sheet2 from './sheet-2'
import sheet3 from './sheet-3'

export const IBSheetSampleData: SheetSampleData[] = [
  sheet1,
  sheet2,
  sheet3
].map(data => {
  const sid = `${data.id}_wrapper`
  set(data, 'el', sid)
  set(data, 'options.Events.onRenderFirstFinish', function(_evt: any) {
    const $el = $(`#${sid}`)
    $el.addClass('loaded')
  })
  return data
})
