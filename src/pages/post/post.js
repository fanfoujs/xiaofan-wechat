const fm = require('../../components/feeds-manager')
const tab = require('../../components/tab')

Page({
  data: {
    photoPaths: null
  },
  onShow: function () {
    tab.renderNotis()
  },
  post: function (e) {
    fm.post({ status: e.detail.value.post }, this.data.photoPaths, this, true)
  },
  reset: function (e) {
    console.log(e)
  },
  photo: function (e) {
    if (this.data.photoPaths) {
      this.setData({
        photoPaths: null
      })
      return
    }
    const that = this
    wx.chooseImage({
      count: 1,
      success: function (res) {
        that.setData({
          photoPaths: res.tempFilePaths
        })
      }
    })
  },
})
