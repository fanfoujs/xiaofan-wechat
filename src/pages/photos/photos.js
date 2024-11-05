const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const network = require('../../mixins/network')
const i18n = require('../../i18n/index')

Page(
  extend({}, tap, {
    data: {
      statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    },
    para: null,
    url: null,
    onLoad(event) {
      this.url = event.url
      this.para = event
      wx.setNavigationBarTitle({title: event.name})
      this.setData({i18n})
      fm.load(this, this.url, this.para)
      network.listen(this)
    },
    onPullDownRefresh() {
      fm.load(this, this.url, this.para)
    },
    onReachBottom() {
      fm.loadMore(this, this.url, this.para)
    },
  }),
)
