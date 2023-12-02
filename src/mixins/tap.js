const fm = require('../components/feeds-manager')
const i18n = require('../i18n/index')
const animations = require('../utils/animations')
const vibrate = require('../utils/vibrate')

module.exports = {
  tapTxt(event) {
    const accounts = wx.getStorageSync('accounts') || []
    const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
    if (isDebug) {
      return
    }

    const txt = event.currentTarget.dataset.value
    switch (txt.type) {
      case 'at': {
        fm.showUser(null, txt.id)
        break
      }

      case 'tag': {
        fm.navigateTo(`../feeds/feeds?q=${txt.query}`)
        break
      }

      default: {
        // Link
        this.handleLink(txt.link)
      }
    }
  },
  tapID(event) {
    const accounts = wx.getStorageSync('accounts') || []
    const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
    if (isDebug) {
      return
    }

    fm.showUser(null, event.currentTarget.dataset.id)
  },
  tapAvatar(event) {
    const accounts = wx.getStorageSync('accounts') || []
    const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
    if (isDebug) {
      return
    }

    fm.showUser(
      event.currentTarget.dataset.user,
      event.currentTarget.dataset.user.id,
    )
  },
  tapName(event) {
    const accounts = wx.getStorageSync('accounts') || []
    const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
    if (isDebug) {
      return
    }

    const {id} = event.currentTarget.dataset
    wx.showModal({
      confirmColor: '#33a5ff',
      content: id,
      confirmText: i18n.feed.copy,
      cancelText: i18n.common.cancel,
      success(result) {
        if (result.confirm) {
          wx.setClipboardData({data: id})
        }
      },
    })
  },
  tapFeed(event) {
    const quickDelete = false // 改为 true：点击消息会直接删除，供测试使用
    if (quickDelete) {
      fm.destroyForTest(event.currentTarget.dataset.feed.id)
      return
    }

    fm.showFeed(event.currentTarget.dataset.feed)
  },
  tapFeedDetail(event) {
    const accounts = wx.getStorageSync('accounts') || []
    const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
    if (isDebug) {
      return
    }

    const itemList = [i18n.feed.copy]
    let id = null
    const {feed} = event.currentTarget.dataset
    if (feed.repost_screen_name && feed.repost_status_id) {
      itemList.push(`${i18n.feed.from} @` + feed.repost_screen_name)
      id = feed.repost_status_id
    } else if (feed.in_reply_to_screen_name && feed.in_reply_to_status_id) {
      itemList.push(`${i18n.feed.reply_to} @` + feed.in_reply_to_screen_name)
      id = feed.in_reply_to_status_id
    }

    wx.showActionSheet({
      itemList,
      success(result) {
        if (result.tapIndex === 0) {
          wx.setClipboardData({data: feed.plain_text})
        } else if (result.tapIndex === 1) {
          fm.showFeed(null, id)
        }
      },
    })
  },
  tapListItem(event) {
    const accounts = wx.getStorageSync('accounts') || []
    const isDebug = accounts.length === 1 && accounts[0].id === 'debug'
    if (isDebug) {
      return
    }

    fm.navigateTo(
      `${event.currentTarget.dataset.page}?url=${event.currentTarget.dataset.url}&id=${this.data.user.id}&name=${event.currentTarget.dataset.name}`,
    )
  },
  tapImage(event) {
    if (event.currentTarget.dataset.photoUrl) {
      fm.showImage(event.currentTarget.dataset.photoUrl)
    }
  },
  tapLink(event) {
    this.handleLink(event.currentTarget.dataset.link)
  },
  handleLink(data) {
    wx.setClipboardData({data})
  },
  follow(event) {
    this.setData(
      {
        buttonPop: animations.pop().export(),
      },
      () => {
        setTimeout(() => {
          fm.follow(event.currentTarget.dataset.user, this)
        }, 200)
      },
    )
  },
  unfollow(event) {
    this.setData(
      {
        buttonPop: animations.pop().export(),
      },
      () => {
        setTimeout(() => {
          fm.unfollow(event.currentTarget.dataset.user, this)
        }, 200)
      },
    )
  },
  block(event) {
    fm.block(event.currentTarget.dataset.user, this)
  },
  unblock(event) {
    fm.unblock(event.currentTarget.dataset.user, this)
  },
  avatarLoad(event) {
    const {id} = event.currentTarget.dataset.user
    const newFeedsArray = this.data.feeds_arr.map((feeds) =>
      feeds.map((item) => {
        if (item.user.id === id && !item.avatarFadeIn) {
          item.avatarFadeIn = animations.fadeIn()
        }

        return item
      }),
    )
    this.setData({
      feeds_arr: newFeedsArray,
    })
  },
  onTabItemTap() {
    vibrate()

    if (!this.tabClick) {
      this.tabClick = 0
    }

    this.tabClick++
    if (this.tabClick > 1) {
      this.tabClick = 0
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300,
      })
    }

    setTimeout(() => {
      this.tabClick = 0
    }, 500)
  },
}
