'use strict'

const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const network = require('../../mixins/network')
const i18n = require('../../i18n/index')
const {getSettings} = require('../../utils/util')

Page(extend({}, tap, {
  data: {
    i18n,
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    settings: getSettings()
  },
  onLoad () {
    fm.load(this)
    network.listen(this)
  },
  onShow () {
    tab.updateNotis()
    this.setData({settings: getSettings()})
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
  }
}))
