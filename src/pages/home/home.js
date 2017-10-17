'use strict'

const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const network = require('../../mixins/network')

Page(extend({}, tap, {
  onLoad () {
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
    return {title: '小饭'}
  }
}))
