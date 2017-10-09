const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')

Page(extend({}, tap, {
  para: null,
  url: null,
  onLoad (e) {
    this.url = e.url
    this.para = e
    wx.setNavigationBarTitle({title: e.name})
    fm.load(this, this.url, this.para)
  },
  onPullDownRefresh () {
    fm.load(this, this.url, this.para)
  },
  onReachBottom () {
    fm.loadMore(this, this.url, this.para)
  }
}))
