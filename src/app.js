'use strict'

const tab = require('./components/tab')

App({
  globalData: {
    notis: null,
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
