const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const animations = require('../../utils/animations')
const tap = require('../../mixins/tap')
const i18n = require('../../i18n/index')

Page(extend({}, tap, {
  data: {
    version: getApp().version,
    direct_messages: {
      name: i18n.me.direct_messages,
      page: '../messages/messages'
    },
    friend_requests: {
      name: i18n.request.name,
      url: '/friendships/requests',
      page: '../users/users'
    },
    change_profile: {
      name: i18n.me.profiles,
      page: '../change-profile/change-profile'
    },
    settings: {
      name: i18n.me.settings,
      page: '../settings/settings'
    },
    logout: {
      name: i18n.me.switch_account,
      page: '../login/login'
    }
  },
  onLoad () {
    wx.setNavigationBarTitle({title: i18n.me.title})
    this.setData({user: getApp().globalData.account.user, i18n})
  },
  onShow () {
    tab.updateNotis()
    fm.loadMe(this)
  },
  onPullDownRefresh () {
    fm.loadMe(this)
  },
  tapAbout () {
    fm.navigateTo('../about/about')
  },
  profileLoad () {
    const fadeIn = animations.fadeIn()
    this.setData({
      profileAnimation: fadeIn.export()
    })
  },
  avatarLoad () {
    const fadeIn = animations.fadeIn()
    this.setData({
      avatarAnimation: fadeIn.export()
    })
  }
}))
