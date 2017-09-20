const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const post = require('../../components/post')

Page(extend({
  data: {
    feed: null,
    feeds: []
  }
}, {
  onLoad: function (e) {
    const feed = getApp().globalData.feed
    this.setData({
      feed: feed,
      feeds: [feed]
    })
      // fm.show('feed.id', this)
  },
  reply: function (e) {
    const feed = this.data.feed
    this.setData({
      param: { status: fm.getAts(feed), in_reply_to_status_id: feed.id }
    })
  },
  repost: function (e) {
    const feed = this.data.feed
    this.setData({
      param: { status: ` 转@${feed.user.name} ${feed.plain_text}`, repost_status_id: feed.id }
    })
  },
  re: function (e) {
    const feed = this.data.feed
    fm.post({ status: ` 转@${feed.user.name} ${feed.plain_text}`, repost_status_id: feed.id }, null, this)
    wx.navigateBack()
  },
  favoriteChange: function (e) {
    fm.favoriteChange(this)
  },
  destroy: function (e) {
    fm.destroy(this.data.feed.id)
  },
  tapImage: function (e) {
    fm.showImage(e.target.dataset.photo.largeurl)
  },
  longPressImage: function (e) {
    fm.showImage(e.target.dataset.photo.originurl)
  }
}, post))
