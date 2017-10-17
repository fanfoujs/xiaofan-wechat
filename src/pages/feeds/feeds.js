const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const network = require('../../mixins/network')

Page(extend({}, tap, {
  para: null,
  url: null,
  onLoad (e) {
    this.url = e.url || '/search/public_timeline'
    this.para = e
    wx.setNavigationBarTitle({title: e.name || e.q || e.url})
    fm.load(this, this.url, this.para)
    network.listen(this)
  },
  onPullDownRefresh () {
    fm.load(this, this.url, this.para)
  },
  onReachBottom () {
    fm.loadMore(this, this.url, this.para)
  }
}))
