const fm = require('../../components/feeds-manager')

let para
let url

Page({
  onLoad (e) {
    url = e.url || '/search/public_timeline'
    para = Object.assign({count: 20}, e)
    wx.setNavigationBarTitle({
      title: e.name || e.q || e.url
    })
    fm.load(this, url, para)
  },
  onPullDownRefresh () {
    fm.load(this, url, para)
  },
  onReachBottom () {
    fm.loadMore(this, url, para)
  },
  tapTxt () {},
  tapFeed (e) {
    fm.showFeed(e.currentTarget.dataset.feed)
  }
})
