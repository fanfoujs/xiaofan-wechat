Page({
  onLoad () {
    const user = getApp().globalData.user
    this.setData({
      user
    })
  },
  tapListItem (e) {
    wx.navigateTo({
      url: `../feeds/feeds?url=${e.currentTarget.dataset.url}&id=${this.data.user.id}&name=${e.currentTarget.dataset.name}`
    })
  }
})
