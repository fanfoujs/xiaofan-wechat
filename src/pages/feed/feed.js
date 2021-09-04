const qs = require('../../utils/fanfou-sdk-node/modules/querystring/index')
const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const animations = require('../../utils/animations')
const post = require('../../mixins/post')
const tap = require('../../mixins/tap')
const i18n = require('../../i18n/index')
const util = require('../../utils/util')
const vibrate = require('../../utils/vibrate')

Page(
  extend({}, tap, post, {
    data: {
      statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
      bottomHeight: util.isIpx() ? 64 : 0,
      hide: false,
    },
    onLoad(event) {
      const accounts = wx.getStorageSync('accounts') || []
      const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
      wx.setNavigationBarTitle({title: i18n.feed.title})
      const {feed} = getApp().globalData
      this.setData({i18n, hide: isDebug})
      if (feed && !event.share) {
        this.setData({feed})
      } else {
        fm.loadFeed(this, decodeURIComponent(event.id))
      }

      const page = this
      setTimeout(() => {
        fm.load(page, '/statuses/context_timeline', {
          id: decodeURIComponent(event.id),
        })
      }, 600)
    },
    reply() {
      const {feed} = this.data
      const status = fm.getAts(feed)
      this.setData(
        {
          replyPop: animations.pop().export(),
          resetPop: null,
          addPhotoPop: null,
          sendPop: null,
        },
        () => {
          setTimeout(() => {
            vibrate()
            this.setData({
              param: {
                status,
                in_reply_to_status_id: feed.id,
              },
              length: status.length,
            })
          }, 200)
        },
      )
    },
    repost() {
      const {feed} = this.data
      const status = ` 转@${feed.user.name} ${feed.plain_text}`
      this.setData(
        {
          repostPop: animations.pop().export(),
          resetPop: null,
          addPhotoPop: null,
          sendPop: null,
        },
        () => {
          setTimeout(() => {
            vibrate()
            this.setData({
              param: {
                status,
                repost_status_id: feed.id,
              },
              length: status.length,
            })
          }, 200)
        },
      )
    },
    re() {
      const {feed} = this.data
      fm.post(this, {
        status: ` 转@${feed.user.name} ${feed.plain_text}`,
        repost_status_id: feed.id,
      })
      wx.navigateBack()
    },
    favoriteChange() {
      this.setData(
        {
          starPop: animations.pop().export(),
        },
        () => {
          fm.favoriteChange(this)
        },
      )
    },
    destroy() {
      this.setData(
        {
          deletePop: animations.pop().export(),
        },
        () => {
          setTimeout(() => {
            wx.showModal({
              title: '',
              content: i18n.feed.delete_confrim,
              confirmText: i18n.common.delete,
              cancelText: i18n.common.cancel,
              confirmColor: '#33a5ff',
              success: (result) => {
                if (result.confirm) {
                  fm.destroy(this.data.feed.id)
                }
              },
            })
          }, 100)
        },
      )
    },
    tapImage() {
      fm.showImage(this.data.feed.photo.largeurl)
    },
    longPressImage() {
      fm.showImage(this.data.feed.photo.originurl)
    },
    onShareAppMessage() {
      const options = {
        id: this.options.id,
        share: true,
      }
      return {
        title: `@${this.data.feed.user.name} 的消息`,
        path: `/${this.route}?${qs.stringify(options)}`,
      }
    },
    imageLoad() {
      this.setData({
        imageFadeIn: animations.fadeIn().export(),
      })
    },
    userAvatarLoad() {
      this.setData({
        userAvatarFadeIn: animations.fadeIn().export(),
      })
    },
  }),
)
