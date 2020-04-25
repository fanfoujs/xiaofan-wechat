const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const network = require('../../mixins/network')
const i18n = require('../../i18n/index')
const {getSettings} = require('../../utils/util')

Page(extend({}, tap, {
  para: null,
  url: null,
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    settings: getSettings(),
    isUserTimeline: false
  },
  onLoad (event) {
    this.url = event.url || '/search/public_timeline'
    this.para = event
    this.id = event.id || null
    const isUserTimeline = this.url === '/statuses/user_timeline'
    const accounts = wx.getStorageSync('accounts') || []
    const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
    this.setData({i18n, isUserTimeline, id: this.id, hide: isDebug})
    console.log(isDebug)
    wx.setNavigationBarTitle({title: event.name || event.q || event.url})
    fm.load(this, this.url, this.para)
    network.listen(this)
  },
  onShow () {
    this.setData({settings: getSettings()})
  },
  onPullDownRefresh () {
    fm.load(this, this.url, this.para)
  },
  onReachBottom () {
    fm.loadMore(this, this.url, this.para)
  },
  onTabItemTap () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  search (event) {
    const url = '/search/user_timeline'
    fm.navigateTo(`../feeds/feeds?url=${url}&q=${event.detail.value}&id=${this.id}`, () => {
      this.setData({
        value: null
      })
    })
  }
}))
