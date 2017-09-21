const fm = require('../../components/feeds-manager')
let para
let url

Page({
  onLoad: function (e) {
    url = e.url || '/search/public_timeline'
    para = Object.assign({ count: 20 }, e)
    wx.setNavigationBarTitle({
      title: e.name || e.q || e.url
    })
    fm.load(this, url, para)
  },
  onPullDownRefresh: function () {
    fm.load(this, url, para)
  },
  onReachBottom: function () {
    fm.loadMore(this, url, para)
  },
  tapTxt: function (e) { },
  tapFeed: function (e) {
    fm.showFeed(e.currentTarget.dataset.feed)
  }
})
