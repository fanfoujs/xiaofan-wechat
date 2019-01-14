const qs = require('../../utils/fanfou-sdk-node/modules/querystring/index')
const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const animations = require('../../utils/animations')
const tap = require('../../mixins/tap')
const post = require('../../mixins/post')
const i18n = require('../../i18n/index')

const getShisTimeline = (page, user) => {
  const {he, she, she_he, his, her, her_his} = i18n.common
  const {timeline} = i18n.me
  let shisTimelineArr = null
  let shisTimeline = null
  switch (i18n.lang) {
    case 'zhCN':
      shisTimelineArr = [she, he, she_he]
      break
    default:
      shisTimelineArr = [her, his, her_his]
      break
  }

  let [h0, h1, h2] = shisTimelineArr
  switch (user.gender) {
    case '女':
      shisTimeline = h0 + timeline
      break
    case '男':
      shisTimeline = h1 + timeline
      break
    default:
      if (h2 === 'TA') {
        h2 += ' '
      }

      shisTimeline = h2 + timeline
      break
  }

  page.setData({shisTimeline})
}

Page(extend({}, tap, post, {
  onLoad (e) {
    wx.setNavigationBarTitle({title: i18n.home.title})
    const {user = {}, appid} = getApp().globalData
    this.setData({user, appid, i18n})
    if (!this.data.user || e.share) {
      fm.loadUser(decodeURIComponent(e.id), this).then(() => {
        getShisTimeline(this, this.data.user)
      })
    } else {
      getShisTimeline(this, this.data.user)
    }

    fm.relationship(decodeURIComponent(e.id), this)
  },
  onPullDownRefresh () {
    fm.loadUser(this.data.user.id, this)
    fm.relationship(this.data.user.id, this)
  },
  message (e) {
    this.setData({
      messagePop: animations.pop().export()
    }, () => {
      setTimeout(() => {
        fm.navigateTo(`../message/message?id=${e.currentTarget.dataset.user.id}&name=${e.currentTarget.dataset.user.name}`)
      }, 200)
    })
  },
  tapDistributor () {
    const page = this
    if (this.data.appid) {
      const ta = this.data.user.taMiddle
      const {name} = this.data.user
      wx.showActionSheet({
        itemList: [`问 @${name} 要微信号`, '已配置好微信权限'],
        success (res) {
          if (res.tapIndex === 0) {
            fm.post(page, {status: `@${name} 需要你的微信号，来帮你配置小饭体验者权限。`}, null, () => {
              wx.showModal({
                confirmColor: '#33a5ff',
                content: `已告诉 @${name} 需要微信号，收到后请去 https://mp.weixin.qq.com 用户身份页，为${ta}添加体验权者权限，再来完成邀请。`,
                showCancel: false,
                confirmText: '好的'
              })
            })
          } else if (res.tapIndex === 1) {
            const appidlink = `open.weixin.qq.com/sns/getexpappinfo?appid=${this.data.appid}#wechat-redirect`
            fm.post(page, {status: `@${name} 复制地址并在微信中访问体验小饭：${appidlink}`}, null, () => {
              wx.showModal({
                confirmColor: '#33a5ff',
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
        itemList: ['已搭建好小饭', '查看搭建教程'],
        success (res) {
          if (res.tapIndex === 0) {
            page.setData({distributor: true})
          } else if (res.tapIndex === 1) {
            page.showTutorial()
          }
        }
      })
    }
  },
  longpressDistributor () {
    const page = this
    wx.showActionSheet({
      itemList: ['删除 App ID', '查看搭建教程'],
      success (res) {
        if (res.tapIndex === 0) {
          wx.removeStorageSync('appid')
          getApp().globalData.appid = null
          page.setData({appid: null})
        } else if (res.tapIndex === 1) {
          page.showTutorial()
        }
      }
    })
  },
  showTutorial () {
    wx.setClipboardData({data: 'http://www.billlee.win/archives/139'})
  },
  reset () {
    this.setData({
      cancelPop: animations.pop().export()
    }, () => {
      setTimeout(() => {
        this.setData({distributor: false})
      }, 200)
    })
  },
  saveAppID (e) {
    const page = this
    const {appid} = e.detail.value
    const {name, taMiddle: ta} = this.data.user
    if (appid) {
      wx.setStorageSync('appid', appid)
      getApp().globalData.appid = appid
      page.setData({appid, distributor: false})
      fm.post(page, {status: '@小饭师傅 我成为了分发者。'}, null, () => {
        wx.showModal({
          confirmColor: '#33a5ff',
          content: `你已成为分发者。请获取 @${name} 的微信号，然后去 https://mp.weixin.qq.com 用户身份页，为${ta}添加体验权者权限，再来完成邀请。`,
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
  },
  onShareAppMessage () {
    const options = {
      id: this.options.id,
      share: true
    }
    return {
      title: this.data.user.name,
      path: `/${this.route}?${qs.stringify(options)}`
    }
  },
  profileLoad () {
    this.setData({
      profileAnimation: animations.fadeIn().export()
    })
  },
  avatarLoad () {
    this.setData({
      avatarAnimation: animations.fadeIn().export()
    })
  }
}))
