'use strict'

const {CONSUMER_KEY} = require('./config/fanfou')

App({
  version: '1.15.0',
  globalData: {
    notis: null,
    account: null,
    feed: null,
    appid: null
  },
  onLaunch () {
    this.globalData.appid = wx.getStorageSync('appid')
    this.checkLogin()
  },
  checkLogin () {
    const [account] = wx.getStorageSync('accounts')
    if (!account || account.length === 0 || account.consumer_key !== CONSUMER_KEY) {
      wx.setStorageSync('accounts', [])
      wx.redirectTo({url: '/pages/login/login'})
    } else {
      this.globalData.account = account || {}
    }
  }
})
