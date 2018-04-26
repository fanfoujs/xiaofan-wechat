'use strict'

const {CONSUMER_KEY} = require('./config/fanfou')

App({
  version: '1.8.1',
  globalData: {
    notis: null,
    account: null,
    feed: null,
    appid: null
  },
  onLaunch () {
    this.globalData.appid = wx.getStorageSync('appid')
    const account = wx.getStorageSync('accounts')[0]
    if (!account || account.consumer_key !== CONSUMER_KEY) {
      wx.setStorageSync('accounts', [])
      wx.redirectTo({url: '/pages/login/login'})
    } else {
      this.globalData.account = account
    }
  }
})
