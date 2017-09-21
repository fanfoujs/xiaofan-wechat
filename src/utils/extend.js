var extend = function (obj) {
  ([].slice.call(arguments, 1) || []).forEach(function (source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop]
      }
    }
  })
  return obj
}

module.exports = extend
