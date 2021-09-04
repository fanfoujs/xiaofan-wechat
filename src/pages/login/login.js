const ff = require('../../utils/fanfou')
const i18n = require('../../i18n/index')
const animations = require('../../utils/animations')

Page({
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
  },
  onLoad() {
    wx.setNavigationBarTitle({title: i18n.login.title})
    const accounts = this.getAccounts()
    const as = wx.getStorageSync('accounts') || []
    const isDebug = as.length === 1 && as[0].id === 'debug'
    this.setData({accounts, i18n, hide: isDebug})
  },

  // Login action
  login(event) {
    this.setData(
      {
        loginButtonPop: animations.pop().export(),
      },
      () => {
        setTimeout(() => {
          wx.showLoading({
            title: i18n.login.fetching,
            mask: true,
          })
          ff.authPromise(
            event.detail.value.username,
            event.detail.value.password,
          )
            .then(() => {
              wx.reLaunch({url: '/pages/home/home'})
            })
            .catch(() => {
              wx.showToast({
                title: i18n.login.fail,
                image: '/assets/toast_fail.png',
                duration: 900,
              })
            })
        }, 100)
      },
    )
  },

  // Get accounts from stroage
  getAccounts() {
    return wx.getStorageSync('accounts') || []
  },

  // Tap to switch account
  tapListItem(event) {
    const {id} = event.currentTarget.dataset
    const accounts = this.getAccounts()
    let index = -1
    for (const [i, element] of accounts.entries()) {
      if (element.id === id) {
        index = i
        break
      }
    }

    if (index >= 0) {
      const [account] = accounts.splice(index, 1)
      accounts.unshift(account)
      getApp().globalData.account = account
      wx.reLaunch({url: '/pages/home/home'})
    }

    wx.setStorageSync('accounts', accounts)
  },
  longpressListItem(event) {
    const page = this
    const accounts = this.getAccounts()
    wx.showActionSheet({
      itemList: [i18n.login.logout],
      success(result) {
        if (!result.cancel) {
          for (const [i, account] of accounts.entries()) {
            if (account.id === event.currentTarget.dataset.id) {
              accounts.splice(i, 1)
              wx.setStorageSync('accounts', accounts)
              const [account] = accounts
              getApp().globalData.account = account
              if (accounts.length === 0) {
                wx.reLaunch({url: '/pages/login/login'})
              } else if (i === 0) {
                wx.reLaunch({url: '/pages/home/home'})
              }

              break
            }
          }

          page.setData({accounts})
        }
      },
    })
  },
})
