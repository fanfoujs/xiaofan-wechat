const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const post = require('../../components/post')

Page(extend({
  data: {
    feed: null,
    feeds: []
  }
}, {
  onLoad () {
    const feed = getApp().globalData.feed
    this.setData({
      feed,
      feeds: [feed]
    })
    // Fm.show('feed.id', this)
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
    fm.post({status: ` 转@${feed.user.name} ${feed.plain_text}`, repost_status_id: feed.id}, null, this)
    wx.navigateBack()
  },
  favoriteChange () {
    fm.favoriteChange(this)
  },
  destroy () {
    fm.destroy(this.data.feed.id)
  },
  tapImage (e) {
    fm.showImage(e.target.dataset.photo.largeurl)
  },
  longPressImage (e) {
    fm.showImage(e.target.dataset.photo.originurl)
  }
}, post))
