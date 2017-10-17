const fm = require('../components/feeds-manager')

module.exports = {
  tapTxt (e) {
    const txt = e.currentTarget.dataset.value
    switch (txt.type) {
      case 'at':
        fm.showUser(null, txt.id)
        break
      case 'tag':
        fm.navigateTo(`../feeds/feeds?q=${txt.query}`)
        break
      default: // Link
        this.handleLink(txt.link)
    }
  },
  tapID (e) {
    fm.showUser(null, e.currentTarget.dataset.id)
  },
  tapAvatar (e) {
    fm.showUser(e.currentTarget.dataset.user)
  },
  tapName (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      confirmColor: '#33a5ff',
      content: id,
      confirmText: '复制',
      success (res) {
        if (res.confirm) {
          wx.setClipboardData({data: id})
        }
      }
    })
  },
  tapFeed (e) {
    const quickDelete = false // 改为 true：点击消息会直接删除，供测试使用
    if (quickDelete) {
      fm.destroyForTest(e.currentTarget.dataset.feed.id)
      return
    }
    fm.showFeed(e.currentTarget.dataset.feed)
  },
  tapFeedDetail (e) {
    const itemList = ['复制']
    let id = null
    const feed = e.currentTarget.dataset.feed
    if (feed.repost_screen_name && feed.repost_status_id) {
      itemList.push('转自 @' + feed.repost_screen_name)
      id = feed.repost_status_id
    } else if (feed.in_reply_to_screen_name && feed.in_reply_to_status_id) {
      itemList.push('回复给 @' + feed.in_reply_to_screen_name)
      id = feed.in_reply_to_status_id
    }
    wx.showActionSheet({
      itemList,
      success (res) {
        if (res.tapIndex === 0) {
          wx.setClipboardData({data: feed.plain_text})
        } else if (res.tapIndex === 1) {
          fm.showFeed(null, id)
        }
      }
    })
  },
  tapListItem (e) {
    fm.navigateTo(`${e.currentTarget.dataset.page}?url=${e.currentTarget.dataset.url}&id=${this.data.user.id}&name=${e.currentTarget.dataset.name}`)
  },
  tapImage (e) {
    if (e.currentTarget.dataset.photoUrl) {
      fm.showImage(e.currentTarget.dataset.photoUrl)
    }
  },
  tapLink (e) {
    this.handleLink(e.currentTarget.dataset.link)
  },
  handleLink (link) {
    wx.setClipboardData({
      data: link,
      success () {
        wx.showModal({
          confirmColor: '#33a5ff',
          content: '链接已复制，请前往浏览器访问。',
          showCancel: false,
          confirmText: '好的'
        })
      }
    })
  },
  follow (e) {
    fm.follow(e.currentTarget.dataset.user, this)
  },
  unfollow (e) {
    fm.unfollow(e.currentTarget.dataset.user, this)
  },
  block (e) {
    fm.block(e.currentTarget.dataset.user, this)
  },
  unblock (e) {
    fm.unblock(e.currentTarget.dataset.user, this)
  }
}
