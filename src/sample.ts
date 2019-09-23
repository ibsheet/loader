// tslint:disable:no-expression-statement
import get from 'lodash/get'
import { ISheetLoaderStatic, ILoaderEvent } from './lib/interface'

import './assets/styles.scss'

// document ready
$((): void => {
  const IBSHEET_BASEURL = '<IBSHEET_BASE_URL>'
  console.log('* jquery loaded:', `v${$.fn.jquery}`)
  const IBSheetLoader = get(window, 'IBSheetLoader')
  const loader: ISheetLoaderStatic = new IBSheetLoader({
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
        test: () => window['Swal'] != null
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
        ],
        test: () => window['IBSheet'] != null
      }
    ],
    ready: function() {
      const registry = this.registry
      console.log('registry list:', registry.list())
      console.log('font-awesome@5:', registry.info('font-awesome@5'))
      console.log('ibsheet@8.0:', registry.info('ibsheet@8.0'))
    }
  })
    .on('loaded', (evt: ILoaderEvent) => {
      const { type, target } = evt
      console.log(`* LoderEvent.${type}:`, target.alias)
      switch (target.alias) {
        case 'swal2@8':
          // const swal = window['Swal']
          // swal.fire('awesome library!')
          break
      }
      // }).load('font-awesome@solid')
    })
    .load(['font-awesome@5', 'swal2@8', 'ibsheet@8.0'])

  console.log('* IBSheetLoader:', `v${loader.version}`)
})
