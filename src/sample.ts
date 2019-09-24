// tslint:disable:no-expression-statement
import get from 'lodash/get'

import './assets/styles.scss'

// document ready
$((): void => {
  const IBSHEET_BASEURL = '<IBSHEET_BASE_URL>'
  console.log('* jquery loaded:', `v${$.fn.jquery}`)
  const IBSheetLoader = get(window, 'IBSheetLoader')
  const options = {
    debug: true,
    retry: {
      intervalTime: 200
    },
    registry: [
      {
        name: 'font-awesome',
        url: 'https://kit.fontawesome.com/21c0a510fd.js',
        version: 5,
        target: 'head',
        dependency: [
          'https://kit-free.fontawesome.com/releases/latest/css/free-v4-shims.min.css',
          'https://kit-free.fontawesome.com/releases/latest/css/free-v4-font-face.min.css',
          'https://kit-free.fontawesome.com/releases/latest/css/free.min.css'
        ]
      },
      {
        name: 'swal2',
        version: 8,
        url: 'https://cdn.jsdelivr.net/npm/sweetalert2@8',
        type: 'js',
        validate: () => window['Swal'] != null
      },
      {
        name: 'ibsheet',
        version: '8.0',
        baseUrl: `${IBSHEET_BASEURL}/v8/core/nightly/latest`,
        urls: [
          'ibsheet.js',
          { url: 'css/default/main.css', target: 'head' },
          'locale/ko.js',
          `${IBSHEET_BASEURL}/v8/ibleaders.js`
        ]
      }
    ],
    ready: function() {
      console.log('* registry list:', this.list())
      // console.log('font-awesome@5:', this.info('font-awesome@5'))
      // console.log('ibsheet@8.0:', this.info('ibsheet@8.0'))
    }
  }
  const loader = new IBSheetLoader(options)
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
      console.log(evt.data.map((item: any) => item.alias))
      console.log(evt.target.list())
    })
    .load()
    // .load(['font-awesome@5', 'swal2@8', 'ibsheet@8.0'])

  // stress load test
  loader
    .load('asdads')
    .load('asdsdfadfsdfs')
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
