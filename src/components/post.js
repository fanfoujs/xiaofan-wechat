const fm = require('/feeds-manager')

module.exports = {
  data: {
    param: null,
    photoPaths: null
  },
  post: function (e) {
    const param = Object.assign(this.data.param || {}, {status: e.detail.value.post})
    fm.post(param, this.data.photoPaths, this, true)
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
}
