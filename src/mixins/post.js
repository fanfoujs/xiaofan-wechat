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
  post (event) {
    this.setData({
      sendPop: animations.pop().export()
    }, () => {
      setTimeout(() => {
        const parameter = Object.assign(this.data.param || {}, {status: event.detail.value.post})
        fm.post(this, parameter, this.data.photoPaths)
      }, 100)
    })
  },
  bindinput (event) {
    this.setData({length: event.detail.value.length})
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
          success (result) {
            page.setData({
              photoPaths: result.tempFilePaths
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
      success (result) {
        page.setData({
          photoPaths: result.tempFilePaths
        })
      }
    })
  },
  removePhoto () {
    const page = this
    wx.showActionSheet({
      itemList: [
        i18n.compose.preview_attachment,
        i18n.compose.remove_attachment
      ],
      success (result) {
        const {tapIndex} = result
        switch (tapIndex) {
          case 0: {
            wx.previewImage({urls: page.data.photoPaths})
            break
          }

          case 1: {
            page.setData({
              photoPaths: null
            })
            break
          }

          default:
            break
        }
      }
    })
  }
}
