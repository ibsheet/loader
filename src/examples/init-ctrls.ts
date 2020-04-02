import find from 'lodash/find'
import isNil from 'lodash/isNil'
import get from 'lodash/get'
import set from 'lodash/set'
import defaultsDeep from 'lodash/defaultsDeep'
import { IBSheetLoaderStatic } from '../lib'

import { IBSheetSampleData } from './sheet-data'

const ALIAS_FONTAWESOME = 'font-awesome@5'
const ALIAS_SWEETALERT = 'swal2@8'
const ALIAS_PRETTYCHKBOX = 'pretty-checkbox'
const ALIAS_IBSHEET = 'ibsheet'

const DEACTIVE_CLASS = 'btn-outline-secondary'
const controlsData = [
  {
    sid: 'on',
    activeClass: 'btn-success'
  },
  {
    sid: 'off',
    activeClass: 'btn-secondary'
  }
]
const testBoxList = [
  { alias: ALIAS_IBSHEET, selector: '#ibsheet.test-box' },
  { alias: ALIAS_FONTAWESOME, selector: '#fa.test-box' },
  { alias: ALIAS_SWEETALERT, selector: '#swal.test-box' },
  { alias: ALIAS_PRETTYCHKBOX, selector: '#pcheckbox.test-box' }
]

function updateTestBoxControls(alias: string, bool: boolean) {
  const data = find(testBoxList, { alias })
  if (isNil(data)) return
  const { selector } = data
  const $testBox = $(selector)
  if (
    (bool && $testBox.hasClass('loaded')) ||
    (!bool && !$testBox.hasClass('loaded'))
  ) {
    return
  }

  const $onBtn = $($testBox.find('.test-ctrl button[data-alias=on]')[0])
  const $offBtn = $($testBox.find('.test-ctrl button[data-alias=off]')[0])
  // const $prevBtn = $($testBox.find('.test-ctrl button.active')[0])

  let $activeBtn
  let $deactiveBtn
  if (bool) {
    $activeBtn = $onBtn
    $deactiveBtn = $offBtn
    $testBox.addClass('loaded')
  } else {
    $activeBtn = $offBtn
    $deactiveBtn = $onBtn
    $testBox.removeClass('loaded')
  }
  const btnData = find(controlsData, { sid: $activeBtn.attr('data-alias') })
  const activeClass = get(btnData, 'activeClass', '')
  $deactiveBtn
    .removeClass(['active', 'btn-success', 'btn-secondary'].join(' '))
    .addClass(DEACTIVE_CLASS)
  $activeBtn.removeClass(DEACTIVE_CLASS).addClass(['active', activeClass])
}

function initIBSheetContainers(loader: IBSheetLoaderStatic) {
  const $sheetTestBody = $('#ibsheet.test-box>.test-body')
  const aSheetContainers: any[] = []

  const ctrlbox = $('<div/>', {
    class: 'ibsheet-ctrlbox'
  }).append(
    IBSheetSampleData.map((data, ndx) => {
      const sheetId = `sheet${ndx + 1}`
      const checkboxId = `${sheetId}_ctrl`
      const $wrapper = $('<div/>', {
        class: 'ibsheet-container',
        css: defaultsDeep(get(data, 'css', {}), {
          width: '100%',
          height: '15rem'
        })
      })
      aSheetContainers.push($wrapper)
      return $('<div/>', {
        class: 'form-check form-check-inline'
      }).append(
        $('<input/>', {
          id: checkboxId,
          type: 'checkbox',
          class: 'form-check-input',
          'data-alias': sheetId
        }).on('change', function(_evt) {
          const el = this as HTMLInputElement
          const bool = el.checked
          if (bool) {
            $wrapper.addClass('active')
            set(data, 'element', $wrapper[0])
            console.log(data)
            loader
              .createSheet(data)
              .then((sheet: any) => {
                console.log('IBSheet version:', sheet.version())
                console.log('ibsheet created:', sheet.id)
                const callback = get(data, 'ready')
                if (isNil(callback)) return
                callback.call(null, sheet)
              })
              .catch(err => {
                throw new Error(err)
              })
          } else {
            loader.removeSheet(sheetId)
            $wrapper.removeClass('active loaded')
          }
        }),
        $('<label/>', {
          type: 'checkbox',
          class: 'form-check-label',
          for: checkboxId,
          text: sheetId
        })
      )
    })
  )

  $sheetTestBody.append(ctrlbox, aSheetContainers)
}

export function initTestBoxControls(loader: IBSheetLoaderStatic) {
  loader
    .bind('loaded unloaded', (evt: any) => {
      const { alias, loaded } = evt.target.raw
      updateTestBoxControls(alias, loaded)
    })
    .list()
    .forEach((data: any) => {
      const { alias, loaded } = data
      updateTestBoxControls(alias, loaded)
    })

  // init test-box
  testBoxList.forEach(data => {
    const { alias, selector } = data
    const $testBox = $(selector).attr('data-alias', alias)
    const ctrlBtns = controlsData.map(_data => {
      const { sid, activeClass } = _data
      const isUnloadCtrl = sid === 'off'
      const classes = ['btn btn-sm']
      if (isUnloadCtrl) {
        classes.push('active', activeClass)
      } else {
        classes.push(DEACTIVE_CLASS)
      }
      return $('<button/>', {
        type: 'button',
        class: classes.join(' '),
        text: sid.toUpperCase(),
        'data-alias': sid
      }).on('click', _evt => {
        const $el = $(_evt.target)
        if ($el.hasClass('active')) {
          return
        }
        const alias = $($el.parents('.test-box')[0]).attr('data-alias')
        if ($el.attr('data-alias') === 'on') {
          loader.load(alias)
        } else {
          IBSheetSampleData.forEach((cur, ndx) => {
            if (cur) {
              const sheetId = `sheet${ndx + 1}`
              const checkboxId = `${sheetId}_ctrl`
              let checkboxObject = $('#' + checkboxId)[0] as HTMLInputElement

              if (checkboxObject && checkboxObject.checked) {
                checkboxObject.checked = false
              }
            }
          })
          $('.ibsheet-container').removeClass('active loaded')
          loader.unload(alias)
        }
      })
    })

    $('<div/>', {
      class: 'test-ctrl btn-group'
    })
      .append(ctrlBtns)
      .appendTo($testBox)
  })

  initIBSheetContainers(loader)
}
