/** tslint:disable:no-expression-statement no-unused-variable */
import './examples/base'
import {
  IBSHEET_BASEURL,
  getLoaderInstance,
  // ibseetLibData,
  // loaderOptions,
  initTestBoxControls
  // IBSheetSampleData
} from './examples'

// document ready
$(async () => {
  const loader = getLoaderInstance()

  // console.log(`==================== 1: SET CONFIG ====================`)
  loader.config({ debug: true })
  // loader.config(loaderOptions)

  // console.log(`==================== 2: ADD EVENT LISTENER ====================`)
  loader
    .on('loaded', function(evt: any) {
      const { type, target } = evt
      console.log(`%c* LoderEvent.${type}: ${target.alias}`, 'color: yellow')
      // switch (target.alias) {
      //   // case 'swal2@8':
      //   //   const swal = window['Swal']
      //   //   swal.fire('awesome library!')
      //   //   break
      //   case 'ibsheet':
      //     this.createSheet(IBSheetSampleData[1]).then((sheet: any) => {
      //       console.log('ibsheet2 created:', sheet.id)
      //     })
      //     break
      // }
      // }).load('font-awesome@solid')
    })
    .on('unloaded', (evt: any) => {
      const { type, target } = evt
      console.log(`%c* LoderEvent.${type}: ${target.alias}`, 'color: red')
    })
    .once('load-complete', (evt: any) => {
      console.log(
        '%c***** (once) load tasks all done *****',
        'background-color:green;color:white'
      )
      console.log(
        '%c[IBSheetLoader] Registered Items:',
        'color:magenta',
        loader.list()
      )
      console.log('loaded items:', evt.data.map((item: any) => item.alias))
    })

  // console.log(`==================== 3: SETUP TEST-BOX CONTROLS ====================`)
  // init test-box controls
  initTestBoxControls(loader)

  console.log(
    `==================== 4-1: FIRST LOAD (registry) ====================`
  )
  loader.registry.addAll([
    {
      name: 'ibsheet-excel',
      url: `${IBSHEET_BASEURL}/v8/plugins/excel/nightly/latest/ibsheet-excel.js`
      // url: `/ibsheet/ibsheet-excel.js`
    },
    {
      name: 'ibsheet-common',
      url: `${IBSHEET_BASEURL}/v8/plugins/common/nightly/latest/ibsheet-common.js`
      // url: `/ibsheet/ibsheet-common.js`
    },
  ])

  // loader.load()
  loader.load({
    name: 'ibsheet',
    baseUrl: `${IBSHEET_BASEURL}/v8/core/nightly/latest`
  })
  .once('loaded', (evt: any) => {
    const item = evt.target
    if (item.name === 'ibsheet') {
      // loader
      //   .load('ibsheet-excel')
      //   .load('ibsheet-common'
      console.log('** plugins load start')
      loader.load([
        'ibsheet-excel',
        'ibsheet-common'
      ])
    }
  })

  // console.log(
  //   `==================== 4-2: FIRST LOAD (immediatly) ====================`
  // )
  // loader.load(555555)
  // loader.load(ibseetLibData)
  // loader.load('aaaaaaaa')
  // loader.load(7777)

  // console.log(`==================== 5: LOAD STRESS TEST ====================`)
  // loader
  //   .load('asdads')
  //   .load('asdsdfadfsdfs')
  //   .load()
  //   .load()
  //   .load()
  //   .load({
  //     name: 'pretty-checkbox',
  //     url:
  //       'https://cdn.jsdelivr.net/npm/pretty-checkbox@3.0/dist/pretty-checkbox.min.css'
  //   })
  //   .load('pretty-checkbox')
  //   .load('ancd')
  //   .load('pretty-checkbox')
  //   .load('pretty-checkbox')
  //   .load('pretty-checkbox')

  // console.log(`==================== 6: LOAD ANOTHER LIBRARIES ====================`)
  // loader.load(['font-awesome', 'swal2'])

  console.log(`==================== 7: CREATE IBSHEET ====================`)

  // loader.createSheet(sheetOpts1).then((sheet: any) => {
  //   console.log('ibsheet1 created:', sheet.id)
  // })
  // loader.createSheet(IBSheetSampleData[1]).then((sheet: any) => {
  //   console.log('ibsheet2 created:', sheet.id)
  // })

  // loader.sheetReady().then((ibsheet: any) => {
  //   const sheet = ibsheet.create(IBSheetSampleData[1])
  //   console.log('ibsheet2 created:', sheet.id)
  // })

  // loader.sheetReady(function(_ibsheet: any) {
  //   const sheet = this.create(IBSheetSampleData[1])
  //   console.log('IBSheet version:', sheet.version())
  //   console.log('ibsheet2 created:', sheet.id)
  // })

  // console.log(`==================== 8: RELOAD TEST ====================`)
  // loader.once('loaded', function (evt: any) {
  //   console.log('%c** reload default library', 'background-color: yellow')
  //   const target = evt.target
  //   switch (target.alias) {
  //     case 'ibsheet':
  //       this.reload()
  //       break
  //   }
  // })

  // confirm ibsheet-loader version
  console.log('* IBSheetLoader:', `v${loader.version}`)

  //   console.log(`==================== 9: SHEET EVENTS TEST ====================`)
  //   loader.bind(
  //     [
  //       'create-sheet',
  //       'create-sheet-failed',
  //       'created-sheet',
  //       'remove-sheet',
  //       'remove-sheet-failed',
  //       'removed-sheet'
  //     ].join(' '),
  //     function(evt: any) {
  //       let msg = ''
  //       switch (evt.type) {
  //         case 'create-sheet':
  //           msg = 'create sheet elementId: ' + evt.data.el
  //           break
  //         case 'create-sheet-failed':
  //           break
  //         case 'created-sheet':
  //           msg = 'created sheet.id: ' + evt.target.id
  //           break
  //         case 'remove-sheet':
  //           msg = 'remove sheet.id:' + evt.target.id
  //           break
  //         case 'remove-sheet-failed':
  //           break
  //         case 'removed-sheet':
  //           msg = 'removed sheet.id: ' + evt.data.id
  //           break
  //       }
  //       console.log(
  //         `%c[SHEET_EVENT.${evt.type}] ${msg}`,
  //         'background-color: yellow;color: black'
  //       )
  //     }
  //   )
  // })
  // loader.once('created-sheet', function(evt: any) {
  //   // evt.target: IBSheet 인스턴스
  //   const sid = evt.target.id
  //   setTimeout(function() {
  //     loader.removeSheet(sid)
  //   }, 3000)
  // })

  // console.log(
  //   `==================== 10: IBSHEET UPDATE TEST ====================`
  // )
  // loader.load({
  //   name: 'ibsheet',
  //   baseUrl: `${IBSHEET_BASEURL}/v8/core/nightly/latest`,
  //   locale: 'ko'
  // })

  // loader.load({
  //   name: 'ibsheet',
  //   locale: 'en'
  // })
})
