const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')

Page(extend({}, tap, {
  para: null,
  url: null,
  onLoad (e) {
    this.url = e.url
    this.para = e
    wx.setNavigationBarTitle({title: e.name})
    this.setData({name: e.name})
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
    const user = e.currentTarget.dataset.user
    const page = this
    wx.showActionSheet({
      itemList: ['接受', `接受并关注${user.taEnd}`],
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
