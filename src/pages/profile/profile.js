const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')

Page(extend({}, tap, {
  data: {
    direct_messages: {
      name: '私信',
      page: '../messages/messages'
    },
    friend_requests: {
      name: '关注申请',
      url: '/friendships/requests',
      page: '../users/users'
    },
    change_profile: {
      name: '修改资料',
      page: '../change-profile/change-profile'
    },
    logout: {
      name: '切换账号',
      page: '../login/login'
    }
  },
  onLoad () {
    this.setData({user: getApp().globalData.account.user})
  },
  onShow () {
    tab.updateNotis()
    fm.loadMe(this)
  },
  onPullDownRefresh () {
    fm.loadMe(this)
    tab.updateNotis()
  }
}))
