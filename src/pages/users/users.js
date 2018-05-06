const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const i18n = require('../../i18n/index')

Page(extend({}, tap, {
  para: null,
  url: null,
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight
  },
  onLoad (e) {
    this.url = e.url
    this.para = e
    wx.setNavigationBarTitle({title: e.name})
    this.setData({name: e.name, i18n})
    fm.load(this, this.url, this.para)
  },
  onPullDownRefresh () {
    fm.load(this, this.url, this.para)
  },
  onReachBottom () {
    fm.loadMore(this, this.url, this.para)
  },
  deny (e) {
    fm.deny(e.currentTarget.dataset.user, this)
  },
  accept (e) {
    const {user} = e.currentTarget.dataset
    const page = this
    wx.showActionSheet({
      itemList: [i18n.request.accept, i18n.request.accept_and_follow],
      success (res) {
        if (res.tapIndex === 0) {
          fm.accept(user, page)
        } else if (res.tapIndex === 1) {
          fm.accept(user, page)
          fm.follow(user, page)
        }
      }
    })
  },
  preventDefault () {}
}))
