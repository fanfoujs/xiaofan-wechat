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
    wx.setClipboardData({data: 'http://fanfou.com/settings/theme'})
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
  },
  profileLoad () {
    const fadeIn = animations.fadeIn()
    this.setData({
      profileAnimation: fadeIn.export()
    })
  },
  avatarLoad () {
    const fadeIn = animations.fadeIn()
    this.setData({
      avatarAnimation: fadeIn.export()
    })
  }
})
