const fm = require('../../components/feeds-manager')

Page({
  data: {
    feed: null,
    feeds: [],
    param: null
  },
  onLoad: function (e) {
    const feed = getApp().globalData.feed
    this.setData({
      feed: feed,
      feeds: [feed]
    })
  },
  reply: function (e) {
    console.log('reply')
    const feed = this.data.feed
    this.setData({
      param: { status: fm.getAts(feed), in_reply_to_status_id: feed.id }
    })
  },
  repost: function (e) {
    if (this.longtap) {
      this.longtap = false
      return
    }
    console.log('repost')
    const feed = this.data.feed
    this.setData({
      param: { status: ` 转@${feed.user.name} ${feed.plain_text}`, repost_status_id: feed.id }
    })
  },
  longtap: false,
  re: function (e) {
    this.longtap = true
    console.log('re')
    const feed = this.data.feed
    fm.post({ status: ` 转@${feed.user.name} ${feed.plain_text}`, repost_status_id: feed.id }, this)
    wx.navigateBack()
  },
  favoriteChange: function (e) {
    fm.favoriteChange(this)
  },
  destroy: function (e) {
    fm.destroy(this.data.feed.id)
  },
  tapImage: function (e) {
    if (this.longtap) {
      this.longtap = false
      return
    }
    console.log('tapImage')
    fm.showImage(e.target.dataset.photo.largeurl)
  },
  longTapImage: function (e) {
    this.longtap = true
    console.log('longTapImage')
    fm.showImage(e.target.dataset.photo.originurl)
  },
  post: function (e) {
    const param = Object.assign(this.data.param, { status: e.detail.value.post })
    fm.post(param, this)
  },
  reset: function (e) {
    this.setData({
      param: null
    })
  }
})
