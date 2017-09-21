const extend = function (obj) {
  ([].slice.call(arguments, 1) || []).forEach(source => {
    if (source) {
      for (const prop in source) {
        if (source[prop]) {
          obj[prop] = source[prop]
        }
      }
    }
  })
  return obj
}

module.exports = extend
