'use strict'

const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const network = require('../../mixins/network')
const i18n = require('../../i18n/index')

Page(extend({}, tap, {
  onLoad () {
    wx.setNavigationBarTitle({title: i18n.home.title})
    this.setData({i18n})
    fm.load(this)
    network.listen(this)
  },
  onShow () {
    tab.updateNotis()
  },
  onPullDownRefresh () {
    fm.load(this)
    tab.updateNotis()
  },
  onReachBottom () {
    fm.loadMore(this)
    tab.updateNotis()
  },
  onShareAppMessage () {
    return {title: i18n.home.title}
  },
  onTabItemTap () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  }
}))
