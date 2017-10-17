'use strict'

module.exports = {
  listen (page) {
    wx.getNetworkType({
      success: function (res) {
        console.log(res.networkType)
        page.setData({isWiFi: res.networkType === 'wifi'})
      }
    })
    wx.onNetworkStatusChange(function (res) {
      console.log(res.networkType)
      page.setData({isWiFi: res.networkType === 'wifi'})
    })
  }
}
