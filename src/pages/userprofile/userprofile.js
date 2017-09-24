const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')

Page(extend({
  onLoad (e) {
    const user = getApp().globalData.user
    if (user) {
      this.setData({user})
    } else {
      fm.loadUser(e.id, this)
    }
  },
  tapListItem (e) {
    fm.navigateTo(`../feeds/feeds?url=${e.currentTarget.dataset.url}&id=${this.data.user.id}&name=${e.currentTarget.dataset.name}`)
  }
}, tap))
