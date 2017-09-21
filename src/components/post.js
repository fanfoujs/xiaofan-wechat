const fm = require('./feeds-manager')

module.exports = {
  data: {
    param: null,
    photoPaths: null
  },
  post (e) {
    const param = Object.assign(this.data.param || {}, {status: e.detail.value.post})
    fm.post(param, this.data.photoPaths, this, true)
  },
  reset () {
    this.setData({
      param: null,
      photoPaths: null
    })
  },
  photo () {
    const that = this
    if (this.data.photoPaths) {
      wx.showActionSheet({
        itemList: ['删除'],
        success (res) {
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
        success (res) {
          that.setData({
            photoPaths: res.tempFilePaths
          })
        }
      })
    }
  }
}
