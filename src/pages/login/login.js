const ff = require('../../utils/fanfou')

Page({
  login: function (e) {
    ff.authPromise(e.detail.value.username, e.detail.value.password)
      .then(tokens => {
        wx.switchTab({
          url: '/pages/home/home'
        })
      })
      .catch(err => console.error('auth rejected', err.message))
  }
})
