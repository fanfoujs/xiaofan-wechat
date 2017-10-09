'use strict'

App({
  version: '1.1.0',
  globalData: {
    notis: null,
    account: null,
    feed: null,
    appid: null
  },
  onLaunch () {
    this.globalData.account = wx.getStorageSync('accounts')[0]
    this.globalData.appid = wx.getStorageSync('appid')
  }
})
