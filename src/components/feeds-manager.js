const ff = require('../utils/fanfou')
const {getSettings, getBlocks, getBlockIds} = require('../utils/util')
const tab = require('../components/tab')
const i18n = require('../i18n/index')
const audio = require('../utils/audio')

function loadMore (page, url, para) {
  const maxId = page.data.feeds_arr.slice(-1)[0].slice(-1)[0].id
  if (page.data.noMore || page.data.showLoader || (!maxId && url !== '/direct_messages/conversation_list')) {
    return
  }

  page.setData({showLoader: true})
  const param = Object.assign({
    count: getSettings().timelineCount,
    format: 'html'
  }, para)
  if (
    url === '/favorites' ||
    url === '/users/friends' ||
    url === '/users/followers' ||
    url === '/direct_messages/conversation_list' ||
    url === '/friendships/requests' ||
    url === '/photos/user_timeline'
  ) {
    param.page = page.data.feeds_arr.length + 1
  } else {
    param.max_id = maxId
  }

  ff.getPromise(url || '/statuses/home_timeline', param)
    .then(res => {
      page.setData({
        showLoader: false,
        noMore: res.length < param.count
      })
      if (res.error) {
        showModal(res.error)
        return
      }

      if (res.length > 0 && maxId === res[0].id) {
        res.shift() // 饭否图片 timeline api 在使用 max_id 时有第 1 条消重复息的 bug，在这里移除
        param.count -= 1
      }

      res = blockFilter(url, res)
      page.setData({
        ['feeds_arr[' + page.data.feeds_arr.length + ']']: res
      }, () => {
        if (page.data.noMore) {
          wx.showToast({title: i18n.common.no_more, image: '/assets/toast_blank.png', duration: 900})
        }
      })
    })
    .catch(err => {
      page.setData({showLoader: false})
      showModal(err.errMsg)
    })
}

function load (page, url, para) {
  page.setData({showLoader: true})
  const param = Object.assign({
    count: getSettings().timelineCount,
    format: 'html'
  }, para)
  ff.getPromise(url || '/statuses/home_timeline', param)
    .then(res => {
      wx.stopPullDownRefresh()
      page.setData({
        showLoader: false,
        noMore: res.length < param.count
      })
      if (res.error && url !== '/statuses/context_timeline') {
        showModal(res.error)
        return
      }

      res = blockFilter(url, res)
      let lastRawId = 0
      try {
        [lastRawId] = page.data.feeds_arr[0].map(item => item.rawid)
      } catch (error) {}

      page.setData({feeds_arr: [res]}, () => {
        if (isTimeline(url)) {
          let withTimelineAudio = false
          try {
            const [latestRawId] = res.map(item => item.rawid)
            withTimelineAudio = latestRawId > lastRawId
          } catch (error) {}

          if (getSettings().timelineAudio && withTimelineAudio) {
            audio.bubble()
          }
        }
      })
      if (url === '/statuses/mentions') {
        tab.clearNotis('mentions')
      }
    })
    .catch(err => {
      wx.stopPullDownRefresh()
      page.setData({showLoader: false})
      if (err.message !== 'not authed' && url !== '/stautses/context_timeline') {
        showModal(err.errMsg || err.message)
      }
    })
}

function isTimeline (url) {
  switch (url || '/statuses/home_timeline') {
    case '/statuses/home_timeline':
    case '/statuses/public_timeline':
    case '/statuses/mentions':
    case '/search/public_timeline':
    case '/statuses/friends_timeline':
    case '/statuses/replies':
    case '/search/user_timeline':
    case '/favorites':
      return true
    default:
      return false
  }
}

function blockFilter (url, res) {
  switch (url || '/statuses/home_timeline') {
    case '/statuses/home_timeline':
    case '/statuses/public_timeline':
    case '/statuses/mentions':
    case '/search/public_timeline':
    case '/statuses/friends_timeline':
    case '/statuses/replies':
    case '/search/user_timeline':
    case '/favorites': {
      const settings = getSettings()
      const blocks = getBlocks()
      const blockIds = getBlockIds()
      const blockNames = blocks.map(item => item.name)
      if (settings.hideBlocks) {
        res = res.filter(status => {
          const userId = status.user.id
          const userUniqueId = status.user.unique_id
          const users = getUsers(status)
          const usersIds = users.map(item => item.id)
          if (blockIds.indexOf(userId) !== -1) {
            return false
          }

          if (blockIds.indexOf(userUniqueId) !== -1) {
            return false
          }

          for (let i = 0; i < usersIds.length; i++) {
            if (blockIds.indexOf(usersIds[i]) !== -1) {
              return false
            }
          }

          for (let i = 0; i < blockNames.length; i++) {
            if (status.plain_text.indexOf(blockNames[i]) !== -1) {
              return false
            }
          }

          return true
        })
      }

      return res
    }

    default:
      return res
  }
}

function favoriteChange (page) {
  if (page.data.feed.favorited) {
    ff.postPromise('/favorites/destroy/' + page.data.feed.id)
      .then(res => {
        if (res.error) {
          showModal(res.error, null)
          return
        }

        page.setData({'feed.favorited': false})
        const [pagePre] = getCurrentPages().slice(-2)
        for (const [feedsIndex, feeds] of pagePre.data.feeds_arr.entries()) {
          for (const [feedIndex, feed] of feeds.entries()) {
            if (feed.id === page.data.feed.id) {
              pagePre.setData({[`feeds_arr[${feedsIndex}][${feedIndex}].favorited`]: false})
              return
            }
          }
        }
      })
      .catch(err => showModal(err.errMsg))
  } else {
    ff.postPromise('/favorites/create/' + page.data.feed.id)
      .then(res => {
        if (res.error) {
          showModal(res.error, null)
          return
        }

        page.setData({'feed.favorited': true})
        const [pagePre] = getCurrentPages().slice(-2)
        for (const [feedsIndex, feeds] of pagePre.data.feeds_arr.entries()) {
          for (const [feedIndex, feed] of feeds.entries()) {
            if (feed.id === page.data.feed.id) {
              pagePre.setData({[`feeds_arr[${feedsIndex}][${feedIndex}].favorited`]: true})
              return
            }
          }
        }
      })
      .catch(err => showModal(err.errMsg))
  }
}

function destroy (id) {
  ff.postPromise('/statuses/destroy', {id})
    .then(() => {
      wx.navigateBack({
        complete () {
          wx.showToast({
            title: i18n.feed.deleted,
            image: '/assets/toast_delete.png',
            duration: 900
          })
          const [page] = getCurrentPages().slice(-2)
          for (const [feedsIndex, feeds] of page.data.feeds_arr.entries()) {
            for (const [feedIndex, feed] of feeds.entries()) {
              if (feed.id === id) {
                page.data.feeds_arr[feedsIndex].splice(feedIndex, 1)
                page.setData({
                  [`feeds_arr[${feedsIndex}]`]: page.data.feeds_arr[feedsIndex]
                })
                return
              }
            }
          }
        }
      })
    })
    .catch(err => showModal(err.errMsg))
}

function destroyForTest (id) {
  ff.postPromise('/statuses/destroy', {id})
    .then(() => {
      const [page] = getCurrentPages().slice(-1)
      for (const [feedsIndex, feeds] of page.data.feeds_arr.entries()) {
        for (const [feedIndex, feed] of feeds.entries()) {
          if (feed.id === id) {
            page.data.feeds_arr[feedsIndex].splice(feedIndex, 1)
            page.setData({
              [`feeds_arr[${feedsIndex}]`]: page.data.feeds_arr[feedsIndex]
            })
            return
          }
        }
      }
    })
    .catch(err => showModal(err.errMsg))
}

function destroyMsg (page, id) {
  ff.postPromise('/direct_messages/destroy', {id})
    .then(() => {
      wx.showToast({
        title: i18n.feed.deleted,
        image: '/assets/toast_delete.png',
        duration: 900
      })
      for (const [feedsIndex, feeds] of page.data.feeds_arr.entries()) {
        for (const [feedIndex, feed] of feeds.entries()) {
          if (feed.id === id) {
            page.data.feeds_arr[feedsIndex].splice(feedIndex, 1)
            page.setData({
              [`feeds_arr[${feedsIndex}]`]: page.data.feeds_arr[feedsIndex]
            })
            return
          }
        }
      }
    })
    .catch(err => showModal(err.errMsg))
}

function postMsg (param, page) {
  page.setData({posting: true})
  ff.postPromise('/direct_messages/new', param)
    .then(res => {
      page.setData({posting: false})
      if (res.error) {
        showModal(res.error)
        return
      }

      wx.showToast({title: i18n.compose.sent, image: '/assets/toast_reply.png', duration: 900})
      const [message] = page.data.feeds_arr
      message.unshift(res)
      page.setData({
        param: null,
        photoPaths: null,
        'feeds_arr[0]': message
      })
    })
    .catch(err => {
      page.setData({posting: false})
      showModal(err.errMsg)
    })
}

function post (page, para, photoPaths, success) {
  const param = Object.assign({format: 'html'}, para)
  page.setData({posting: true})
  if (photoPaths) {
    _postPhoto(page, param, photoPaths, success)
  } else {
    _postText(page, param, success)
  }
}

function _postText (page, param, success) {
  const direct = !(param.repost_status_id || param.in_reply_to_status_id || success)
  const image = param.repost_status_id ?
    '/assets/toast_repost.png' : param.in_reply_to_status_id ?
      '/assets/toast_reply.png' : '/assets/toast_post.png'
  const title = param.repost_status_id ?
    i18n.feed.reposted : param.in_reply_to_status_id ?
      i18n.feed.replied : i18n.feed.published
  ff.postPromise('/statuses/update', param)
    .then(res => {
      page.setData({posting: false})
      if (res.error) {
        showModal(res.error)
        return
      }

      if (direct) {
        wx.switchTab({
          url: '/pages/home/home',
          success: () => {
            wx.showToast({title, image, duration: 900})
            _loadFeedThenAddToHome(res.id)
          }
        })
      } else {
        wx.showToast({title, image, duration: 900})
        if (param.in_reply_to_status_id) {
          _loadFeedThenAddToReply(res.id)
        }
      }

      page.setData({
        param: null,
        photoPaths: null,
        length: 0
      })
      if (typeof success === 'function') {
        success()
      }
    })
    .catch(err => {
      page.setData({posting: false})
      showModal(err.errMsg)
    })
}

function _postPhoto (page, param, photoPaths, success) {
  const direct = !(param.repost_status_id || param.in_reply_to_status_id)
  const title = i18n.feed.published
  const image = '/assets/toast_photo.png'
  ff.uploadPromise('/photos/upload', photoPaths, param)
    .then(res => {
      page.setData({posting: false})
      if (res.error) {
        showModal(res.error)
        return
      }

      if (direct) {
        wx.switchTab({
          url: '/pages/home/home',
          success: () => {
            wx.showToast({title, image, duration: 900})
            _loadFeedThenAddToHome(res.id)
          }
        })
      } else {
        wx.showToast({title, image, duration: 900})
        if (param.in_reply_to_status_id) {
          _loadFeedThenAddToReply(res.id)
        }
      }

      page.setData({
        param: null,
        photoPaths: null,
        length: 0
      })
      if (typeof success === 'function') {
        success()
      }
    })
    .catch(err => {
      page.setData({posting: false})
      showModal(err.errMsg)
    })
}

function updateAvatar (page, photoPaths) {
  const title = i18n.me.avatar_updated
  const image = '/assets/toast_done.png'
  ff.uploadPromise('/account/update_profile_image', photoPaths)
    .then(res => {
      if (res.error) {
        showModal(res.error)
        return
      }

      wx.showToast({title, image, duration: 900})
      const [currentPage] = getCurrentPages().slice(-1)
      if (currentPage.route === 'pages/profile/profile') {
        this.loadMe(currentPage)
      }
    })
    .catch(err => showModal(err.errMsg))
}

function updateProfile (page, param) {
  const title = i18n.me.profile_updated
  const image = '/assets/toast_done.png'
  ff.postPromise('/account/update_profile', param)
    .then(res => {
      if (res.error) {
        showModal(res.error)
        return
      }

      wx.navigateBack({
        complete () {
          wx.showToast({title, image, duration: 900})
        }
      })
    })
    .catch(err => showModal(err.errMsg))
}

function showImage (url) {
  wx.previewImage({
    current: url,
    urls: [url]
  })
}

function showUser (user, id) {
  getApp().globalData.user = user
  this.navigateTo(`../userprofile/userprofile?id=${id || user.id}`)
}

function loadUser (id, page) {
  return new Promise(resolve => {
    ff.getPromise('/users/show', {id, format: 'html'})
      .then(res => {
        wx.stopPullDownRefresh()
        if (res.error) {
          showModal(res.error)
          return
        }

        const user = res
        page.setData({user}, () => {
          resolve(user)
        })
      })
      .catch(err => {
        if (err.message !== 'not authed') {
          showModal(err.errMsg || err.message)
        }
      })
  })
}

function showFeed (feed, id) {
  getApp().globalData.feed = feed
  this.navigateTo(`../feed/feed?id=${id || feed.id}`)
}

function showModal (err, title) {
  const para = {
    confirmColor: '#33a5ff',
    title: title || i18n.common.error,
    content: err,
    showCancel: false,
    confirmText: i18n.common.ok,
    cancelText: i18n.common.cancel
  }
  if (title === null) {
    delete para.title
  }

  if (!err) {
    delete para.content
  }

  wx.showModal(para)
}

function loadFeed (page, id) {
  ff.getPromise('/statuses/show', {id, format: 'html'})
    .then(res => {
      wx.stopPullDownRefresh()
      if (res.error) {
        wx.showModal({
          confirmColor: '#33a5ff',
          title: i18n.common.error,
          content: res.error,
          showCancel: false,
          confirmText: i18n.common.ok,
          success: () => {
            wx.navigateBack()
          }
        })
        return
      }

      page.setData({feed: res})
    })
    .catch(err => {
      if (err.message !== 'not authed') {
        showModal(err.errMsg || err.message)
      }
    })
}

function _loadFeedThenAddToHome (id) {
  ff.getPromise('/statuses/show', {id, format: 'html'})
    .then(res => {
      if (res.error) {
        return
      }

      const [page] = getCurrentPages()
      if (page.route === 'pages/home/home') {
        const [feeds] = page.data.feeds_arr
        feeds.unshift(res)
        page.setData({'feeds_arr[0]': feeds})
      }
    })
    .catch(err => showModal(err.errMsg))
}

function _loadFeedThenAddToReply (id) {
  ff.getPromise('/statuses/show', {id, format: 'html'})
    .then(res => {
      if (res.error) {
        return
      }

      const [page] = getCurrentPages().slice(-1)
      if (page.route === 'pages/feed/feed') {
        const [feeds] = page.data.feeds_arr
        feeds.push(res)
        page.setData({'feeds_arr[0]': feeds})
      }
    })
    .catch(err => showModal(err.errMsg))
}

function getAts (status) {
  const fanfouId = getApp().globalData.account.user.id
  const ats = []
  ats.push(`@${status.user.name}`)
  status.txt.forEach(item => {
    if (item.type === 'at' && item.id !== fanfouId) {
      ats.push(item.text)
    }
  })
  return [...(new Set(ats))].join(' ') + ' '
}

function getUsers (status) {
  const fanfouId = getApp().globalData.account.user.id
  const users = []
  status.txt.forEach(item => {
    if (item.type === 'at' && item.id !== fanfouId) {
      users.push(item)
    }
  })
  return [...(new Set(users))]
}

function loadMe (page) {
  ff.loadMePromise(getApp().globalData.account.tokens)
    .then(res => {
      wx.stopPullDownRefresh()
      if (res.error) {
        showModal(res.error)
        return
      }

      page.setData({user: res.user})
    })
}

function navigateTo (url, success) {
  wx.navigateTo({
    url,
    fail () {
      wx.redirectTo({url})
    },
    success
  })
}

function follow (user, page) {
  ff.postPromise('/friendships/create', {id: user.id})
    .then(res => {
      if (res.error) {
        showModal(res.error, null)
        return
      }

      page.setData({
        'relationship.following': true,
        buttonPop: null
      })
    })
    .catch(err => showModal(err.errMsg))
}

function unfollow (user, page) {
  wx.showActionSheet({
    itemList: [i18n.me.unfollow],
    success (res) {
      if (!res.cancel) {
        ff.postPromise('/friendships/destroy', {id: user.id})
          .then(() => {
            page.setData({
              'relationship.following': false,
              buttonPop: null
            })
          })
          .catch(err => showModal(err.errMsg))
      }
    }
  })
}

function block (user, page) {
  wx.showActionSheet({
    itemList: [i18n.me.block],
    success (res) {
      if (!res.cancel) {
        ff.postPromise('/blocks/create', {id: user.id})
          .then(() => {
            page.setData({
              'relationship.blocking': true,
              'relationship.following': false,
              'relationship.followed_by': false
            })
          })
          .catch(err => showModal(err.errMsg))
      }
    }
  })
}

function unblock (user, page) {
  wx.showActionSheet({
    itemList: [i18n.me.unblock],
    success (res) {
      if (!res.cancel) {
        ff.postPromise('/blocks/destroy', {id: user.id})
          .then(() => {
            page.setData({'relationship.blocking': false})
          })
          .catch(err => showModal(err.errMsg))
      }
    }
  })
}

function relationship (targetId, page) {
  ff.getPromise('/friendships/show', {
    source_id: getApp().globalData.account.user.id,
    target_id: targetId
  })
    .then(res => {
      if (res.error) {
        showModal(res.error)
        return
      }

      page.setData({
        relationship: {
          following: res.relationship.source.following === 'true',
          followed_by: res.relationship.source.followed_by === 'true',
          blocking: res.relationship.source.blocking === 'true'
        }
      })
    })
    .catch(err => showModal(err.errMsg))
}

function accept (user, page) {
  ff.postPromise('/friendships/accept', {id: user.unique_id})
    .then(res => {
      if (res.error) {
        showModal(res.error)
        return
      }

      for (const [feedsIndex, feeds] of page.data.feeds_arr.entries()) {
        for (const [feedIndex, feed] of feeds.entries()) {
          if (feed.unique_id === user.unique_id) {
            page.setData({[`feeds_arr[${feedsIndex}][${feedIndex}].accept`]: true})
            return
          }
        }
      }
    })
    .catch(err => showModal(err.errMsg))
}

function deny (user, page) {
  ff.postPromise('/friendships/deny', {id: user.unique_id})
    .then(res => {
      if (res.error) {
        showModal(res.error)
        return
      }

      for (const [feedsIndex, feeds] of page.data.feeds_arr.entries()) {
        for (const [feedIndex, feed] of feeds.entries()) {
          if (feed.unique_id === user.unique_id) {
            page.data.feeds_arr[feedsIndex].splice(feedIndex, 1)
            page.setData({[`feeds_arr[${feedsIndex}]`]: page.data.feeds_arr[feedsIndex]})
            return
          }
        }
      }
    })
    .catch(err => showModal(err.errMsg))
}

module.exports = {
  load,
  loadMore,
  destroy,
  post,
  getAts,
  favoriteChange,
  showUser,
  showFeed,
  showImage,
  showModal,
  loadMe,
  loadUser,
  loadFeed,
  follow,
  unfollow,
  navigateTo,
  relationship,
  block,
  unblock,
  accept,
  deny,
  postMsg,
  destroyMsg,
  updateAvatar,
  updateProfile,
  destroyForTest
}
