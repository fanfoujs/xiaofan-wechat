Page({
  onLoad: function (e) {
    const user = getApp().globalData.user
    this.setData({
      user: user
    })
  },
  tapListItem: function (e) {
    wx.navigateTo({
      url: `../feeds/feeds?url=${e.currentTarget.dataset.url}&id=${this.data.user.id}`
    })
  }
})
