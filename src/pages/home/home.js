const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')

Page({
  onLoad () {
    if (getApp().globalData.account) {
      fm.load(this)
    } else {
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },
  onShow () {
    tab.renderNotis()
  },
  onPullDownRefresh () {
    fm.load(this)
    tab.updateNotis()
  },
  onReachBottom () {
    fm.loadMore(this)
  },
  onShareAppMessage () {
    return {
      title: '小饭'
    }
  },
  tapTxt () {},
  tapAvatar (e) {
    fm.showUser(e.currentTarget.dataset.user)
  },
  tapFeed (e) {
    // Fm.destroy(e.currentTarget.dataset.feed.id) // 快速删除测试消息
    fm.showFeed(e.currentTarget.dataset.feed)
  }
})
