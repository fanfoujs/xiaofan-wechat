const tab = require('../../components/tab')
Page({
  data: {
    noti_messages_count: {name: '私信', badge: 6},
    noti_friendship_count: {name: '关注申请', badge: 7},
    change_profile: {name: '修改资料'},
    logout: {name: '切换账号', action: 'logout'}
  },
  onLoad: function (e) {
    this.setData({
      user: getApp().globalData.account.user
    })
  },
  onShow: function () {
    tab.renderNotis()
  },
  tapListItem: function (e) {
    wx.navigateTo({
      url: `../feeds/feeds?url=${e.currentTarget.dataset.url}&name=${e.currentTarget.dataset.name}`
    })
  },
  logout: function (e) {
    wx.navigateTo({
      url: '../login/login'
    })
  }
})
