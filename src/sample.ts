// tslint:disable:no-expression-statement
import get from 'lodash/get'
import {
  ISheetLoaderStatic,
  ILoaderEvent
} from './lib/interface'

import './assets/styles.scss'

// document ready
$((): void => {
  console.log('* jquery loaded:', `v${$.fn.jquery}`)
  const IBSheetLoader = get(window, 'IBSheetLoader')
  const loader: ISheetLoaderStatic = new IBSheetLoader({
    debug: true,
    retry: {
      intervalTime: 100
    },
    registry: [
      {
        name: 'font-awesome',
        url: 'https://kit.fontawesome.com/21c0a510fd.js',
        version: 5,
        target: 'head'
      },
      {
        name: 'swal2',
        version: 8,
        url: 'https://cdn.jsdelivr.net/npm/sweetalert2@8',
        type: 'js',
        test: () => window['Swal'] != null
      }
    ],
    ready: function() {
      console.log('registry list:', this.registry.list())
    }
  }).on('loaded', (evt: ILoaderEvent) => {
    const { type, target } = evt
    console.log(`* LoderEvent.${type}:`, target.alias)
    switch (target.alias) {
      case 'swal2@8':
        // const swal = window['Swal']
        // swal.fire('awesome library!')
        break
    }
  // }).load('font-awesome@solid')
  }).load([
    'font-awesome@5',
    'swal2@8'
  ])

  console.log('* IBSheetLoader:', `v${loader.version}`)
  console.log(loader.registry.info('font-awesome@5'))
})
