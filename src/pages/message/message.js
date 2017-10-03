const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const post = require('../../mixins/post')

const url = '/direct_messages/conversation'

Page(extend({}, post, {
  id: null,
  onLoad (e) {
    wx.setNavigationBarTitle({title: e.name})
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
        content: '对方还没有关注你，请用饭否网页版发送私信。',
        showCancel: false,
        confirmText: '好的'
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
  tapMessage (e) {
    // 删除和复制消息
    console.log(e.currentTarget.dataset)
  }
}))
