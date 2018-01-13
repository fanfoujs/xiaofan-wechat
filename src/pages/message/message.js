const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const post = require('../../mixins/post')
const i18n = require('../../i18n/index')

const url = '/direct_messages/conversation'

Page(extend({}, post, {
  id: null,
  onLoad (e) {
    wx.setNavigationBarTitle({title: e.name})
    this.setData({i18n})
    this.id = e.id
    fm.load(this, url, {id: this.id})
    fm.relationship(this.id, this)
  },
  onPullDownRefresh () {
    fm.load(this, url, {id: this.id})
  },
  onReachBottom () {
    fm.loadMore(this, url, {id: this.id})
  },
  reply () {
    if (!this.data.relationship.followed_by) {
      wx.showModal({
        confirmColor: '#33a5ff',
        content: i18n.me.not_friend_yet,
        showCancel: false,
        confirmText: i18n.common.ok
      })
      return
    }
    this.setData({
      param: {user: this.id, text: ''}
    })
  },
  post (e) {
    const param = Object.assign(this.data.param || {}, {text: e.detail.value.post})
    fm.postMsg(param, this)
  },
  tapMsg (e) {
    const page = this
    wx.showActionSheet({
      itemList: ['复制', '删除'],
      success (res) {
        if (res.tapIndex === 0) {
          wx.setClipboardData({data: e.currentTarget.dataset.msg.text})
        } else if (res.tapIndex === 1) {
          fm.destroyMsg(page, e.currentTarget.dataset.msg.id)
        }
      }
    })
  }
}))
