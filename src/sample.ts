// tslint:disable:no-expression-statement
import './examples/base'
import {
  getLoaderInstance,
  initTestBoxControls,
  IBSheetSampleData
} from './examples'

// document ready
$((): void => {
  const loader = getLoaderInstance()
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
    .once('load-complete', (evt: any) => {
      console.log('***** loader first load tasks all done *****')
      console.log('%c[IBSheetLoader] Registered Items:', 'color:magenta', loader.list())
      console.log('loaded items:', evt.data.map((item: any) => item.alias))
    })

  // init test-box controls
  initTestBoxControls(loader)

  // ==================== first load ====================
  // console.log(`~~~~~~~~~~~~~ 1: first load ~~~~~~~~~~~~~`)
  // loader.load()

  // ==================== load stress test ====================
  // console.log(`~~~~~~~~~~~~~ 2: load stress test ~~~~~~~~~~~~~`)
  // loader
  //   .load('asdads')
  //   .load('asdsdfadfsdfs')
  //   .load()
  //   .load()
  //   .load()
  //   .load({
  //     name: 'pretty-checkbox',
  //     url: 'https://cdn.jsdelivr.net/npm/pretty-checkbox@3.0/dist/pretty-checkbox.min.css'
  //   })
  //   .load('ancd')
  //   .load('pretty-checkbox')
  //   .load('pretty-checkbox')
  //   .load('pretty-checkbox')
  //   .load('pretty-checkbox')

  // ==================== load another library ====================
  // console.log(`~~~~~~~~~~~~~ 3: load another libraries ~~~~~~~~~~~~~`)
  // loader.load(['font-awesome', 'swal2'])

  // ==================== create ibsheet ====================
  console.log(`~~~~~~~~~~~~~ 4: create ibsheet ~~~~~~~~~~~~~`)
  const options = IBSheetSampleData[0]

  loader.createSheet(options)


  // confirm ibsheet-loader version
  console.log('* IBSheetLoader:', `v${loader.version}`)
})
