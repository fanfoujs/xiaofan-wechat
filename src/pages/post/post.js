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
    this.setData({
      photoPaths: null
    })
  },
  photo: function (e) {
    const that = this
    if (this.data.photoPaths) {
      wx.showActionSheet({
        itemList: ['删除'],
        success: function (res) {
          that.setData({
            photoPaths: null
          })
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
