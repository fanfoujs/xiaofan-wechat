const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')

Page(extend({}, tap, {
  para: null,
  url: null,
  onLoad (e) {
    this.url = e.url || '/search/public_timeline'
    this.para = e
    wx.setNavigationBarTitle({
      title: e.name || e.q || e.url
    })
    fm.load(this, this.url, this.para)
  },
  onPullDownRefresh () {
    fm.load(this, this.url, this.para)
  },
  onReachBottom () {
    fm.loadMore(this, this.url, this.para)
  },
  tapFeed (e) {
    fm.showFeed(e.currentTarget.dataset.feed)
  }
}))
