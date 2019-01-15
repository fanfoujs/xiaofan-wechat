const fm = require('../components/feeds-manager')
const i18n = require('../i18n/index')
const animations = require('../utils/animations')

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
    fm.showUser(e.currentTarget.dataset.user, e.currentTarget.dataset.user.id)
  },
  tapName (e) {
    const {id} = e.currentTarget.dataset
    wx.showModal({
      confirmColor: '#33a5ff',
      content: id,
      confirmText: i18n.feed.copy,
      cancelText: i18n.common.cancel,
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
    const itemList = [i18n.feed.copy]
    let id = null
    const {feed} = e.currentTarget.dataset
    if (feed.repost_screen_name && feed.repost_status_id) {
      itemList.push(`${i18n.feed.from} @` + feed.repost_screen_name)
      id = feed.repost_status_id
    } else if (feed.in_reply_to_screen_name && feed.in_reply_to_status_id) {
      itemList.push(`${i18n.feed.reply_to} @` + feed.in_reply_to_screen_name)
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
  handleLink (data) {
    wx.setClipboardData({data})
  },
  follow (e) {
    this.setData({
      buttonPop: animations.pop().export()
    }, () => {
      setTimeout(() => {
        fm.follow(e.currentTarget.dataset.user, this)
      }, 200)
    })
  },
  unfollow (e) {
    this.setData({
      buttonPop: animations.pop().export()
    }, () => {
      setTimeout(() => {
        fm.unfollow(e.currentTarget.dataset.user, this)
      }, 200)
    })
  },
  block (e) {
    fm.block(e.currentTarget.dataset.user, this)
  },
  unblock (e) {
    fm.unblock(e.currentTarget.dataset.user, this)
  },
  avatarLoad (e) {
    const {id} = e.currentTarget.dataset.user
    const newFeedsArr = this.data.feeds_arr.map(feeds => {
      return feeds.map(item => {
        if (item.user.id === id && !item.avatarFadeIn) {
          item.avatarFadeIn = animations.fadeIn()
        }

        return item
      })
    })
    this.setData({
      feeds_arr: newFeedsArr
    })
  },
  onTabItemTap () {
    if (!this.tabClick) {
      this.tabClick = 0
    }

    this.tabClick++
    if (this.tabClick > 1) {
      this.tabClick = 0
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
    }

    setTimeout(() => {
      this.tabClick = 0
    }, 500)
  }
}
