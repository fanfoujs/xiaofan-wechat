const fm = require('../components/feeds-manager')

module.exports = {
  data: {
    param: null,
    photoPaths: null,
    posting: false,
    length: 140
  },
  post (e) {
    const param = Object.assign(this.data.param || {}, {status: e.detail.value.post})
    fm.post(param, this.data.photoPaths, this)
  },
  bindinput (e) {
    this.setData({length: 140 - e.detail.value.length})
  },
  reset () {
    this.setData({
      param: null,
      photoPaths: null,
      posting: false
    })
  },
  addPhoto () {
    const that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      success (res) {
        that.setData({
          photoPaths: res.tempFilePaths
        })
      }
    })
  },
  addGif () {
    const that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album'],
      success (res) {
        that.setData({
          photoPaths: res.tempFilePaths
        })
      }
    })
  },
  removePhoto () {
    const that = this
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
  }
}
