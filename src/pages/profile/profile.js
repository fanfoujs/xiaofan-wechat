const tab = require('../../components/tab')
const ff = require('../../utils/fanfou')

Page({
  data: {
    noti_messages_count: {name: '私信', badge: 6},
    noti_friendship_count: {name: '关注申请', badge: 7},
    change_profile: {name: '修改资料'},
    logout: {name: '切换账号', action: 'logout'}
  },
  onLoad () {
    this.setData({
      user: getApp().globalData.account.user
    })
  },
  onShow () {
    tab.renderNotis()
  },
  onPullDownRefresh () {
    ff.reloadUser(this)
  },
  tapListItem (e) {
    wx.navigateTo({
      url: `../feeds/feeds?url=${e.currentTarget.dataset.url}&name=${e.currentTarget.dataset.name}`
    })
  },
  logout () {
    wx.navigateTo({
      url: '../login/login'
    })
  }
})
