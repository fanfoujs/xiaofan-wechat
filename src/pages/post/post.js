const fm = require('../../components/feeds-manager')
const tab = require('../../components/tab')

Page({
  onShow: function () {
    tab.renderNotis()
  },
  post: function (e) {
    fm.post({ status: e.detail.value.post }, this)
  },
  reset: function (e) {
    console.log(e)
  }
})
