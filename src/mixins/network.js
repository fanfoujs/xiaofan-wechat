'use strict'

module.exports = {
  listen (page) {
    wx.getNetworkType({
      success (res) {
        console.log(res.networkType)
        page.setData({isWiFi: res.networkType === 'wifi'})
      }
    })
    wx.onNetworkStatusChange(res => {
      console.log(res.networkType)
      page.setData({isWiFi: res.networkType === 'wifi'})
    })
  }
}
