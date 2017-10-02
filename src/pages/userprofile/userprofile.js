const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')

Page(extend({}, tap, {
  onLoad (e) {
    this.setData({user: getApp().globalData.user})
    if (!this.data.user) {
      fm.loadUser(e.id, this)
    }
    fm.relationship(e.id, this)
  },
  onPullDownRefresh () {
    fm.loadUser(this.data.user.id, this)
    fm.relationship(this.data.user.id, this)
  },
  message (e) {
    fm.navigateTo(`../message/message?id=${e.currentTarget.dataset.user.id}`)
  }
}))
