'use strict'

const ff = require('../../utils/fanfou')

Page({
  onLoad () {
    const accounts = this.getAccounts()
    this.setData({accounts})
  },

  // Login action
  login (e) {
    ff.authPromise(e.detail.value.username, e.detail.value.password)
      .then(() => {
        wx.reLaunch({url: '/pages/home/home'})
      })
      .catch(err => console.error('auth rejected', err.message))
  },

  // Get accounts from stroage
  getAccounts () {
    return wx.getStorageSync('accounts') || []
  },

  // Tap to switch account
  tapListItem (e) {
    const {id} = e.target.dataset
    const accounts = this.getAccounts()
    let index = -1
    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i].id === id) {
        index = i
        break
      }
    }
    if (index >= 0) {
      const account = accounts.splice(index, 1)[0]
      accounts.unshift(account)
      getApp().globalData.account = account
      wx.reLaunch({url: '/pages/home/home'})
    }
    wx.setStorageSync('accounts', accounts)
  },
  longpressListItem (e) {
    const that = this
    const accounts = this.getAccounts()
    wx.showActionSheet({
      itemList: ['退出登录'],
      success (res) {
        if (!res.cancel) {
          const {id} = e.target.dataset
          let index = -1
          for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].id === id) {
              index = i
              break
            }
          }
          if (index >= 0) {
            accounts.splice(index, 1)
            wx.setStorageSync('accounts', accounts)
            getApp().globalData.account = accounts[0]
            if (index === 0) {
              wx.reLaunch({url: '/pages/home/home'})
            }
          }
          that.setData({accounts})
        }
      }
    })
  }
})
