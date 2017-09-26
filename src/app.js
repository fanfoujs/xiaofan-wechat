'use strict'

const tab = require('./components/tab')

App({
  globalData: {
    notis: {},
    account: null,
    feed: null
  },
  onLaunch () {
    const accounts = wx.getStorageSync('accounts')
    this.globalData.account = accounts[0]
  },
  onShow () {
    tab.updateNotis()
  }
})
