'use strict'

module.exports = {
  listen (page) {
    wx.getNetworkType({
      success (result) {
        page.setData({isWiFi: result.networkType === 'wifi'})
      }
    })
    wx.onNetworkStatusChange(result => {
      page.setData({isWiFi: result.networkType === 'wifi'})
    })
  }
}
