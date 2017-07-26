const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')

Page({
  onLoad: function () {
    if (getApp().globalData.account == null) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
    } else {
      fm.load(this)
    }
  },
  onShow: function () {
    tab.renderNotis()
  },
  onPullDownRefresh: function () {
    fm.load(this)
    tab.updateNotis()
  },
  onReachBottom: function () {
    fm.loadMore(this)
  },
  onShareAppMessage: function () {
    return {
      title: '小饭'
    }
  },
  tapTxt: function (e) {
    console.log(e.target.dataset.value)
  },
  tapAvatar: function (e) {
    fm.showUser(e.currentTarget.dataset.user)
  },
  tapFeed: function (e) {
    // fm.destroy(e.currentTarget.dataset.feed.id) // 快速删除测试消息
    fm.showFeed(e.currentTarget.dataset.feed)
  }
})
