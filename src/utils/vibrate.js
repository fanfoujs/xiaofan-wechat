const {getSettings} = require('./util')

module.exports = () => {
  if (getSettings().vibrate) {
    wx.vibrateShort()
  }
}
