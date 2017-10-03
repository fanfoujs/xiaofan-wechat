'use strict'

const tab = require('./components/tab')

App({
  globalData: {
    notis: {},
    account: null,
    feed: null,
    appidlink: null
  },
  onLaunch () {
    this.globalData.account = wx.getStorageSync('accounts')[0]
    this.globalData.appidlink = wx.getStorageSync('appidlink')
  },
  onShow () {
    tab.updateNotis()
  }
})
