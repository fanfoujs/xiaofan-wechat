'use strict'

const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const network = require('../../mixins/network')
const i18n = require('../../i18n/index')
const {getSettings} = require('../../utils/util')

Page(extend({}, tap, {
  data: {
    i18n,
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    settings: getSettings()
  },
  onLoad () {
    const accounts = wx.getStorageSync('accounts') || []
    const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
    this.setData({hide: isDebug})
    if (isDebug) {
      wx.hideTabBar()
    }

    if (isDebug) {
      fm.load(this, '/statuses/user_timeline', {id: 'yocat'})
      return
    }

    fm.load(this)
    network.listen(this)
  },
  onShow () {
    tab.updateNotis()
    this.setData({settings: getSettings()})
  },
  onPullDownRefresh () {
    const accounts = wx.getStorageSync('accounts') || []
    const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
    if (isDebug) {
      wx.hideTabBar()
    }

    if (isDebug) {
      fm.load(this, '/statuses/user_timeline', {id: 'yocat'})
      return
    }

    fm.load(this)
    tab.updateNotis()
  },
  onReachBottom () {
    const accounts = wx.getStorageSync('accounts') || []
    const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
    if (isDebug) {
      wx.hideTabBar()
    }

    if (isDebug) {
      fm.loadMore(this, '/statuses/user_timeline', {id: 'yocat'})
      return
    }

    fm.loadMore(this)
    tab.updateNotis()
  },
  onShareAppMessage () {
    return {title: i18n.home.title}
  }
}))
