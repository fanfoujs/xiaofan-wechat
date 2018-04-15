const fm = require('../../components/feeds-manager')
const i18n = require('../../i18n/index')
const animations = require('../../utils/animations')

Page({
  onLoad () {
    this.setData({user: getApp().globalData.account.user, i18n})
  },
  tapAvatar () {
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
  },
  tapBackground () {
    wx.setClipboardData({
      data: 'http://fanfou.com/settings/theme',
      success () {
        wx.showModal({
          confirmColor: '#33a5ff',
          content: i18n.me.change_bg_info,
          showCancel: false,
          confirmText: i18n.common.ok,
          cancelText: i18n.common.cancel
        })
      }
    })
  },
  save (e) {
    this.setData({
      savePop: animations.pop().export()
    }, () => {
      setTimeout(() => {
        if (this.data.photoPaths) {
          fm.updateAvatar(this, this.data.photoPaths)
        }
        fm.updateProfile(this, e.detail.value)
      }, 200)
    })
  }
})
