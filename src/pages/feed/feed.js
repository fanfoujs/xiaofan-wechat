const fm = require('../../components/feeds-manager')

Page({
  data: {
    feed: null,
    feeds: [],
    param: null,
    photoPaths: null
  },
  onLoad: function (e) {
    const feed = getApp().globalData.feed
    this.setData({
      feed: feed,
      feeds: [feed]
    })
    // fm.show('feed.id', this)
  },
  reply: function (e) {
    console.log('reply')
    const feed = this.data.feed
    this.setData({
      param: {status: fm.getAts(feed), in_reply_to_status_id: feed.id}
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
      param: {status: ` 转@${feed.user.name} ${feed.plain_text}`, repost_status_id: feed.id}
    })
  },
  longtap: false,
  re: function (e) {
    this.longtap = true
    console.log('re')
    const feed = this.data.feed
    fm.post({status: ` 转@${feed.user.name} ${feed.plain_text}`, repost_status_id: feed.id}, null, this)
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
    const param = Object.assign(this.data.param, {status: e.detail.value.post})
    fm.post(param, this.data.photoPaths, this)
  },
  reset: function (e) {
    this.setData({
      param: null,
      photoPaths: null
    })
  },
  photo: function (e) {
    const that = this
    if (this.data.photoPaths) {
      wx.showActionSheet({
        itemList: ['删除'],
        success: function (res) {
          if (!res.cancel) {
            that.setData({
              photoPaths: null
            })
          }
        }
      })
    } else {
      wx.chooseImage({
        count: 1,
        success: function (res) {
          that.setData({
            photoPaths: res.tempFilePaths
          })
        }
      })
    }
  }
})
