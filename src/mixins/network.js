'use strict'

module.exports = {
  listen (page) {
    wx.getNetworkType({
      success (res) {
        page.setData({isWiFi: res.networkType === 'wifi'})
      }
    })
    wx.onNetworkStatusChange(res => {
      page.setData({isWiFi: res.networkType === 'wifi'})
    })
  }
}
