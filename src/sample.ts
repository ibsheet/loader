// tslint:disable:no-expression-statement
import './examples/base'
import {
  getLoader,
  initCtrls
} from './examples'

// document ready
$((): void => {
  const loader = getLoader()
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
      console.log('***** load complete *****')
      console.log('%c[IBSheetLoader] Registered Items:', 'color:magenta', loader.list())
      console.log('loaded items:', evt.data.map((item: any) => item.alias))
    })

  // init test-box controls
  initCtrls(loader)

  console.log(`~~~~~~~~~~~~~ 1 ~~~~~~~~~~~~~`)
  loader.load()

  console.log(`~~~~~~~~~~~~~ 2 ~~~~~~~~~~~~~`)
  // stress load test
  loader
    .load('asdads')
    .load('asdsdfadfsdfs')
    .load()
    .load()
    .load()
    .load({
      name: 'pretty-checkbox',
      url: 'https://cdn.jsdelivr.net/npm/pretty-checkbox@3.0/dist/pretty-checkbox.min.css'
    })
    .load('ancd')
    .load('pretty-checkbox')
    .load('pretty-checkbox')
    .load('pretty-checkbox')
    .load('pretty-checkbox')

  // confirm ibsheet-loader version
  console.log('* IBSheetLoader:', `v${loader.version}`)
})
