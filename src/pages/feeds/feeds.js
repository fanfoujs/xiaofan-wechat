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
  onLoad (e) {
    this.url = e.url || '/search/public_timeline'
    this.para = e
    this.id = e.id
    const isUserTimeline = this.url === '/statuses/user_timeline'
    this.setData({i18n, isUserTimeline, id: this.id})
    wx.setNavigationBarTitle({title: e.name || e.q || e.url})
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
  search (e) {
    const url = '/search/user_timeline'
    fm.navigateTo(`../feeds/feeds?url=${url}&q=${e.detail.value}&id=${this.id}`, () => {
      this.setData({
        value: null
      })
    })
  }
}))
