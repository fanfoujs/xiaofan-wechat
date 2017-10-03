const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const post = require('../../mixins/post')
const tap = require('../../mixins/tap')

Page(extend({}, tap, post, {
  onLoad (e) {
    const feed = getApp().globalData.feed
    this.setData({feed})
    if (!feed) {
      fm.loadFeed(this, e.id)
    }
    const page = this
    setTimeout(() => {
      fm.load(page, '/statuses/context_timeline', {id: e.id})
    }, 600)
  },
  reply () {
    const feed = this.data.feed
    this.setData({
      param: {status: fm.getAts(feed), in_reply_to_status_id: feed.id}
    })
  },
  repost () {
    const feed = this.data.feed
    this.setData({
      param: {status: ` 转@${feed.user.name} ${feed.plain_text}`, repost_status_id: feed.id}
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
    fm.showImage(this.feed.photo.largeurl)
  },
  longPressImage () {
    fm.showImage(this.data.feed.photo.originurl)
  }
}))
