const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const para = {count: 10}
const completions = [function () { tab.clearNotis(1, 0) }, null]
const urls = ['/statuses/mentions', '/statuses/replies']
// todo 把 urls 和 com 合并

Page({
  data: {
    index: 0
  },
  onLoad: function () {
    fm.load(this, urls[this.data.index], para, completions[this.data.index])
  },
  onShow: function () {
    tab.renderNotis()
  },
  onPullDownRefresh: function () {
    fm.load(this, urls[this.data.index], para, completions[this.data.index])
  },
  onReachBottom: function () {
    fm.loadMore(this, urls[this.data.index], para)
  },
  tapTxt: function (e) { },
  tapAvatar: function (e) {
    fm.showUser(e.currentTarget.dataset.user)
  },
  tapFeed: function (e) {
    fm.showFeed(e.currentTarget.dataset.feed)
  },
  tapIndex: function (e) {
    const index = e.target.dataset.index
    if (index !== this.data.index) {
      this.setData({
        feeds_arr: null,
        index: index
      })
      fm.load(this, urls[this.data.index], para, completions[this.data.index])
    }
  }
})
