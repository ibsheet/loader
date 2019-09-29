/** tslint:disable:no-expression-statement no-unused-variable */
import './examples/base'
import {
  getLoaderInstance,
  // ibseetLibData,
  loaderOptions,
  initTestBoxControls,
  IBSheetSampleData
} from './examples'

// document ready
$((): void => {
  const loader = getLoaderInstance()

  // console.log(`==================== 1: SET CONFIG ====================`)
  // loader.config({ debug: true })
  loader.config(loaderOptions)

  // console.log(`==================== 2: ADD EVENT LISTENER ====================`)
  loader
    .on('loaded', (evt: any) => {
      const { type, target } = evt
      console.log(`%c* LoderEvent.${type}: ${target.alias}`, 'color: blue')
      switch (target.alias) {
        case 'swal2@8':
          // const swal = window['Swal']
          // swal.fire('awesome library!')
          break
      }
      // }).load('font-awesome@solid')
    })
    .on('unloaded', (evt: any) => {
      const { type, target } = evt
      console.log(`%c* LoderEvent.${type}: ${target.alias}`, 'color: red')
    })
    .once('load-complete', (evt: any) => {
      console.log(
        '%c***** (once) load tasks all done *****',
        'background-color:blue;color:white'
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

  // console.log(
  //   `==================== 4-1: FIRST LOAD (registry) ====================`
  // )
  // loader.load()

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
  const sheet1Opts = IBSheetSampleData[1]
  $('#ibsheet.test-box>.test-body').append($('<div/>', {
    id: sheet1Opts.elementId,
    css: {
      width: '100%',
      height: '240px'
    }
  }))
  loader.createSheet(sheet1Opts).then((sheet: any) => {
    console.log(sheet.id)

  })

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
})
