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
  onLoad (event) {
    this.url = event.url
    this.para = event
    wx.setNavigationBarTitle({title: event.name})
    this.setData({name: event.name, i18n})
    fm.load(this, this.url, this.para)
  },
  onPullDownRefresh () {
    fm.load(this, this.url, this.para)
  },
  onReachBottom () {
    fm.loadMore(this, this.url, this.para)
  },
  deny (event) {
    fm.deny(event.currentTarget.dataset.user, this)
  },
  accept (event) {
    const {user} = event.currentTarget.dataset
    const page = this
    wx.showActionSheet({
      itemList: [i18n.request.accept, i18n.request.accept_and_follow],
      success (result) {
        if (result.tapIndex === 0) {
          fm.accept(user, page)
        } else if (result.tapIndex === 1) {
          fm.accept(user, page)
          fm.follow(user, page)
        }
      }
    })
  },
  preventDefault () {}
}))
