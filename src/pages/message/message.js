const fm = require('../../components/feeds-manager')
const extend = require('../../utils/extend')
const animations = require('../../utils/animations')
const post = require('../../mixins/post')
const i18n = require('../../i18n/index')
const vibrate = require('../../utils/vibrate')

const url = '/direct_messages/conversation'

Page(
  extend({}, post, {
    id: null,
    data: {
      statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
      bottomHeight: wx.getSystemInfoSync().statusBarHeight,
    },
    onLoad(event) {
      this.setData({i18n})
      this.id = event.id
      fm.load(this, url, {id: this.id})
      fm.relationship(this.id, this)
    },
    onPullDownRefresh() {
      fm.load(this, url, {id: this.id})
    },
    onReachBottom() {
      fm.loadMore(this, url, {id: this.id})
    },
    reply() {
      this.setData(
        {
          replyPop: animations.pop().export(),
          resetPop: null,
          sendPop: null,
        },
        () => {
          setTimeout(() => {
            vibrate()
            if (!this.data.relationship.followed_by) {
              wx.showModal({
                confirmColor: '#33a5ff',
                content: i18n.me.not_friend_yet,
                showCancel: false,
                confirmText: i18n.common.ok,
                cancelText: i18n.common.cancel,
              })
              return
            }

            this.setData({
              param: {user: this.id, text: ''},
            })
          }, 200)
        },
      )
    },
    post(event) {
      this.setData(
        {
          sendPop: animations.pop().export(),
        },
        () => {
          setTimeout(() => {
            const parameter = Object.assign(this.data.param || {}, {
              text: event.detail.value.post,
            })
            fm.postMsg(parameter, this)
          }, 200)
        },
      )
    },
    tapMsg(event) {
      const page = this
      wx.showActionSheet({
        itemList: ['复制', '删除'],
        success(result) {
          if (result.tapIndex === 0) {
            wx.setClipboardData({data: event.currentTarget.dataset.msg.text})
          } else if (result.tapIndex === 1) {
            fm.destroyMsg(page, event.currentTarget.dataset.msg.id)
          }
        },
      })
    },
  }),
)
