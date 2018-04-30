const fm = require('../components/feeds-manager')
const i18n = require('../i18n/index')
const animations = require('../utils/animations')

module.exports = {
  data: {
    param: null,
    photoPaths: null,
    posting: false,
    length: 0,
    i18n,
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight
  },
  post (e) {
    this.setData({
      sendPop: animations.pop().export()
    }, () => {
      setTimeout(() => {
        const param = Object.assign(this.data.param || {}, {status: e.detail.value.post})
        fm.post(this, param, this.data.photoPaths)
      }, 100)
    })
  },
  bindinput (e) {
    this.setData({length: e.detail.value.length})
  },
  reset () {
    this.setData({
      resetPop: animations.pop().export()
    }, () => {
      setTimeout(() => {
        this.setData({
          param: null,
          photoPaths: null,
          posting: false,
          length: 0
        })
      }, 100)
    })
  },
  addPhoto () {
    this.setData({
      addPhotoPop: animations.pop().export()
    }, () => {
      setTimeout(() => {
        const page = this
        wx.chooseImage({
          count: 1,
          sizeType: ['original', 'compressed'],
          success (res) {
            page.setData({
              photoPaths: res.tempFilePaths
            })
          }
        })
      }, 100)
    })
  },
  addGif () {
    const page = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album'],
      success (res) {
        page.setData({
          photoPaths: res.tempFilePaths
        })
      }
    })
  },
  removePhoto () {
    const page = this
    wx.showActionSheet({
      itemList: [i18n.compose.remove_attachment],
      success (res) {
        if (!res.cancel) {
          page.setData({
            photoPaths: null
          })
        }
      }
    })
  }
}
