const qs = require('../../utils/fanfou-sdk-node/modules/querystring/index')
const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const post = require('../../mixins/post')
const tap = require('../../mixins/tap')

Page(extend({}, tap, post, {
  onLoad (e) {
    const feed = getApp().globalData.feed
    if (feed && !e.share) {
      this.setData({feed})
    } else {
      fm.loadFeed(this, e.id)
    }
    const page = this
    setTimeout(() => {
      fm.load(page, '/statuses/context_timeline', {id: e.id})
    }, 600)
  },
  reply () {
    const feed = this.data.feed
    const status = fm.getAts(feed)
    this.setData({
      param: {
        status,
        in_reply_to_status_id: feed.id
      },
      length: status.length
    })
  },
  repost () {
    const feed = this.data.feed
    const status = ` 转@${feed.user.name} ${feed.plain_text}`
    this.setData({
      param: {
        status,
        repost_status_id: feed.id
      },
      length: status.length
    })
  },
  re () {
    const feed = this.data.feed
    fm.post(this, {status: ` 转@${feed.user.name} ${feed.plain_text}`, repost_status_id: feed.id})
    wx.navigateBack()
  },
  favoriteChange () {
    fm.favoriteChange(this)
  },
  destroy () {
    fm.destroy(this.data.feed.id)
  },
  tapImage () {
    fm.showImage(this.data.feed.photo.largeurl)
  },
  longPressImage () {
    fm.showImage(this.data.feed.photo.originurl)
  },
  onShareAppMessage () {
    const options = {
      id: this.options.id,
      share: true
    }
    return {
      title: `@${this.data.feed.user.name} 的消息`,
      path: `/${this.route}?${qs.stringify(options)}`
    }
  }
}))
