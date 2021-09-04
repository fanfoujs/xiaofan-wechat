const tab = require('../../components/tab')
const extend = require('../../utils/extend')
const post = require('../../mixins/post')
const i18n = require('../../i18n/index')
const vibrate = require('../../utils/vibrate')

Page(
  extend({}, post, {
    onLoad() {
      wx.setNavigationBarTitle({title: i18n.compose.title})
    },
    onShow() {
      tab.updateNotis()
    },
    onTabItemTap() {
      vibrate()
    },
  }),
)
