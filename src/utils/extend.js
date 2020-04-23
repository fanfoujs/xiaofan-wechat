const extend = function (object) {
  ([].slice.call(arguments, 1) || []).forEach(source => {
    if (source) {
      for (const prop in source) {
        if (source[prop]) {
          object[prop] = source[prop]
        }
      }
    }
  })
  return object
}

module.exports = extend
