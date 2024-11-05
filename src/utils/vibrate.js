const {getSettings} = require('./util')

// eslint-disable-next-line unicorn/no-anonymous-default-export
module.exports = () => {
  if (getSettings().vibrate) {
    wx.vibrateShort()
  }
}
