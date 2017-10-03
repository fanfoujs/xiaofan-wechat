const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const post = require('../../mixins/post')

Page(extend({}, tap, post, {
  onLoad (e) {
    this.setData({user: getApp().globalData.user})
    if (!this.data.user) {
      fm.loadUser(e.id, this)
    }
    fm.relationship(e.id, this)
  },
  onPullDownRefresh () {
    fm.loadUser(this.data.user.id, this)
    fm.relationship(this.data.user.id, this)
  },
  message (e) {
    fm.navigateTo(`../message/message?id=${e.currentTarget.dataset.user.id}&name=${e.currentTarget.dataset.user.name}`)
  },
  tapDistributor () {
    const page = this
    if (getApp().globalData.appidlink) {
      const ta = this.data.user.taMiddle
      const name = this.data.user.name
      wx.showActionSheet({
        itemList: [`问 @${name} 要微信号`, '已配置好微信权限'],
        success (res) {
          if (res.tapIndex === 0) {
            fm.post(page, {status: `@${name} 需要你的微信号来配置小饭体验者权限。`}, null, () => {
              wx.showModal({
                content: `已告诉 @${name} 需要微信号，收到后请去 https://mp.weixin.qq.com 用户身份页，为${ta}添加体验权者权限，再来完成邀请。`,
                showCancel: false,
                confirmText: '好的'
              })
            })
          } else if (res.tapIndex === 1) {
            fm.post(page, {status: `@${name} 微信访问 ${getApp().globalData.appidlink} 体验小饭。`}, null, () => {
              wx.showModal({
                content: '邀请已经发出。',
                showCancel: false,
                confirmText: '好的'
              })
            })
          }
        }
      })
    } else {
      wx.showActionSheet({
        itemList: [`已搭建好小饭`, `查看如何搭建`],
        success (res) {
          if (res.tapIndex === 0) {
            page.setData({distributor: true})
          } else if (res.tapIndex === 1) {
            wx.setClipboardData({
              data: 'http://www.billlee.win/archives/139',
              success () {
                wx.showModal({
                  content: '教程链接已复制，请前往浏览器访问。',
                  showCancel: false,
                  confirmText: '好的'
                })
              }
            })
            // TODO: fm.navigateTo('../tutorial/tutorial')
          }
        }
      })
    }
  },
  longpressDistributor () {
    wx.showActionSheet({
      itemList: ['删除 App ID'],
      success (res) {
        if (res.tapIndex === 0) {
          wx.removeStorageSync('appidlink')
          getApp().globalData.appidlink = null
        }
      }
    })
  },
  reset () {
    this.setData({distributor: false})
  },
  saveAppID (e) {
    const page = this
    const appid = e.detail.value.appid
    const ta = this.data.user.taMiddle
    const name = this.data.user.name
    if (appid) {
      const appidlink = `https://open.weixin.qq.com/sns/getexpappinfo?appid=${appid}#wechat-redirect`
      wx.setStorageSync('appidlink', appidlink)
      getApp().globalData.appidlink = appidlink
      page.setData({distributor: false})
      fm.post(page, {status: `@小饭师傅 我成为了分发者。`}, null, () => {
        wx.showModal({
          content: `请获取 @${name} 的微信号，然后去 https://mp.weixin.qq.com 用户身份页，为${ta}添加体验权者权限，再来完成邀请。`,
          showCancel: false,
          confirmText: '好的',
          success (res) {
            if (res.confirm) {
              page.tapDistributor()
            }
          }
        })
      })
    }
  }
}))
