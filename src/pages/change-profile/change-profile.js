const fm = require('../../components/feeds-manager')

Page({
  onLoad () {
    this.setData({user: getApp().globalData.account.user})
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
          content: '背景图只能在网页修改，链接已复制，请前往浏览器访问。',
          showCancel: false,
          confirmText: '好的'
        })
      }
    })
  },
  save (e) {
    if (this.data.photoPaths) {
      fm.updateAvatar(this, this.data.photoPaths)
    }
    fm.updateProfile(this, e.detail.value)
  }
})
