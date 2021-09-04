const extend = function (object) {
  for (const source of Array.prototype.slice.call(arguments, 1) || []) {
    if (source) {
      for (const prop in source) {
        if (source[prop]) {
          object[prop] = source[prop]
        }
      }
    }
  }

  return object
}

module.exports = extend
