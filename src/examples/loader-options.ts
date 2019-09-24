import {
  IBSHEET_BASEURL
} from './constant'

const ibsheetJs = {
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

const fontAwesome = {
  name: 'font-awesome',
  url: 'https://kit.fontawesome.com/21c0a510fd.js',
  version: 5,
  target: 'head',
  dependency: [
    'https://kit-free.fontawesome.com/releases/latest/css/free-v4-shims.min.css',
    'https://kit-free.fontawesome.com/releases/latest/css/free-v4-font-face.min.css',
    'https://kit-free.fontawesome.com/releases/latest/css/free.min.css'
  ]
}

export const loaderOptions = {
  debug: true,
  retry: {
    intervalTime: 200
  },
  registry: [
    ibsheetJs,
    fontAwesome,
    {
      name: 'swal2',
      version: 8,
      url: 'https://cdn.jsdelivr.net/npm/sweetalert2@8',
      type: 'js',
      validate: () => window['Swal'] != null
    }
  ],
  ready: function() {
    console.log('* registry list:', this.list())
    // console.log('font-awesome@5:', this.info('font-awesome@5'))
    // console.log('ibsheet@8.0:', this.info('ibsheet@8.0'))
  }
}

export default loaderOptions
