const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')

const url = '/direct_messages/conversation_list'

Page(extend({}, tap, {
  onLoad () {
    fm.load(this, url)
  },
  onPullDownRefresh () {
    fm.load(this, url)
  },
  onReachBottom () {
    fm.loadMore(this, url)
  },
  tapMessage (e) {
    fm.navigateTo(`../message/message?id=${e.currentTarget.dataset.message.otherid}`)
  }
}))
