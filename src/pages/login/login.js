const ff = require('../../utils/fanfou')

Page({
  login (e) {
    ff.authPromise(e.detail.value.username, e.detail.value.password)
      .then(() => {
        wx.switchTab({
          url: '/pages/home/home'
        })
      })
      .catch(err => console.error('auth rejected', err.message))
  }
})
