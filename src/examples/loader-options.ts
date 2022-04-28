import { IBSHEET_BASEURL } from './constant'

export const ibsheetLibData = {
  name: 'ibsheet',
  baseUrl: `${IBSHEET_BASEURL}/v8/core/nightly/latest`,
  // version: '8.0',
  theme: 'default',
  license: `${IBSHEET_BASEURL}/v8/ibleaders.js`
  // urls: [
  //   'ibsheet.js',
  //   'locale/ko.js',
  //   // 'locale/en.js',
  //   // `${IBSHEET_BASEURL}/v8/ibleaders.js`
  //   { url: 'css/default/main.css', target: 'head' },
  // ]
}

const fontAwesome = {
  name: 'font-awesome',
  url: 'https://kit.fontawesome.com/21c0a510fd.js',
  version: 5,
  target: 'head',
  dependentUrls: [
    'https://kit-free.fontawesome.com/releases/latest/css/free-v4-shims.min.css',
    'https://kit-free.fontawesome.com/releases/latest/css/free-v4-font-face.min.css',
    'https://kit-free.fontawesome.com/releases/latest/css/free.min.css'
  ]
}

const swal2 = {
  name: 'swal2',
  version: 8,
  url: 'https://cdn.jsdelivr.net/npm/sweetalert2@8',
  type: 'js',
  validate: () => window['Swal'] != null,
  unload: () => (window['Swal'] = undefined)
}

export const loaderOptions = {
  debug: true,
  retry: {
    intervalTime: 200
  },
  registry: [
    ibsheetLibData,
    fontAwesome,
    swal2,
    {
      name: 'pretty-checkbox',
      url:
        'https://cdn.jsdelivr.net/npm/pretty-checkbox@3.0/dist/pretty-checkbox.min.css'
    }
  ],
  ready: function() {
    console.log(
      '%c[IBSheetLoader] Registered Items:',
      'color:magenta',
      this.list()
    )
    // console.log('font-awesome@5:', this.info('font-awesome@5'))
    // console.log('ibsheet@8.0:', this.info('ibsheet@8.0'))
  }
}

export default loaderOptions
