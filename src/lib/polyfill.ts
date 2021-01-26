let setPolyfill = () => {
  // Polyfill 추가 함수.
  /**
   * Polyfill
   * https://stackoverflow.com/questions/57092091/how-to-fix-unhandled-promise-rejection-typeerror-object-doesnt-support-proper/57094003
   */
  if ('NodeList' in window && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function(callback, thisArg) {
      thisArg = thisArg || window
      for (let i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this)
      }
    }
  }
}

export default setPolyfill
