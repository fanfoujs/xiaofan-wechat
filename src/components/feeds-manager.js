const ff = require('../utils/fanfou')
const {getSettings, getBlocks, getBlockIds} = require('../utils/util')
const tab = require('../components/tab')
const i18n = require('../i18n/index')
const audio = require('../utils/audio')
const vibrate = require('../utils/vibrate')

function loadMore (page, url, para) {
  const maxId = page.data.feeds_arr.slice(-1)[0].slice(-1)[0].id
  if (page.data.noMore || page.data.showLoader || (!maxId && url !== '/direct_messages/conversation_list')) {
    return
  }

  page.setData({showLoader: true})
  const parameter = Object.assign({
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
    parameter.page = page.data.feeds_arr.length + 1
  } else {
    parameter.max_id = maxId
  }

  ff.getPromise(url || '/statuses/home_timeline', parameter)
    .then(result => {
      page.setData({
        showLoader: false,
        noMore: result.length < parameter.count
      })
      if (result.error) {
        showModal(result.error)
        return
      }

      if (result.length > 0 && maxId === result[0].id) {
        result.shift() // 饭否图片 timeline api 在使用 max_id 时有第 1 条消重复息的 bug，在这里移除
        parameter.count -= 1
      }

      result = blockFilter(url, result)
      page.setData({
        ['feeds_arr[' + page.data.feeds_arr.length + ']']: result
      }, () => {
        if (page.data.noMore) {
          wx.showToast({title: i18n.common.no_more, image: '/assets/toast_blank.png', duration: 900})
        }
      })

      vibrate()
    })
    .catch(error => {
      page.setData({showLoader: false})
      showModal(error.errMsg)
    })
}

function load (page, url, para) {
  page.setData({showLoader: true})
  const parameter = Object.assign({
    count: getSettings().timelineCount,
    format: 'html'
  }, para)
  ff.getPromise(url || '/statuses/home_timeline', parameter)
    .then(result => {
      wx.stopPullDownRefresh()
      page.setData({
        showLoader: false,
        noMore: result.length < parameter.count
      })
      if (result.error && url !== '/statuses/context_timeline') {
        showModal(result.error)
        return
      }

      result = blockFilter(url, result)
      let lastRawId = 0
      try {
        [lastRawId] = page.data.feeds_arr[0].map(item => item.rawid)
      } catch {}

      page.setData({feeds_arr: [result]}, () => {
        if (isTimeline(url)) {
          vibrate()
          let withTimelineAudio = false
          try {
            const [latestRawId] = result.map(item => item.rawid)
            withTimelineAudio = latestRawId > lastRawId
          } catch {}

          if (getSettings().timelineAudio && withTimelineAudio) {
            audio.bubble()
          }
        }
      })
      if (url === '/statuses/mentions') {
        tab.clearNotis('mentions')
      }
    })
    .catch(error => {
      wx.stopPullDownRefresh()
      page.setData({showLoader: false})
      if (error.message !== 'not authed' && url !== '/stautses/context_timeline') {
        showModal(error.errMsg || error.message)
      }
    })
}

function isTimeline (url) {
  switch (url || '/statuses/home_timeline') {
    case '/statuses/home_timeline':
    case '/statuses/user_timeline':
    case '/photos/user_timeline':
    case '/statuses/public_timeline':
    case '/statuses/mentions':
    case '/search/public_timeline':
    case '/statuses/friends_timeline':
    case '/statuses/replies':
    case '/search/user_timeline':
    case '/favorites':
    case '/users/friends':
    case '/users/followers':
    case '/direct_messages/conversation_list':
    case '/direct_messages/conversation':
      return true
    default:
      return false
  }
}

function blockFilter (url, result) {
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
        result = result.filter(status => {
          const userId = status.user.id
          const userUniqueId = status.user.unique_id
          const users = getUsers(status)
          const usersIds = users.map(item => item.id)
          if (blockIds.includes(userId)) {
            return false
          }

          if (blockIds.includes(userUniqueId)) {
            return false
          }

          for (const element of usersIds) {
            if (blockIds.includes(element)) {
              return false
            }
          }

          for (const element of blockNames) {
            if (status.plain_text.includes(element)) {
              return false
            }
          }

          return true
        })
      }

      return result
    }

    default:
      return result
  }
}

function favoriteChange (page) {
  if (page.data.feed.favorited) {
    ff.postPromise('/favorites/destroy/' + page.data.feed.id)
      .then(result => {
        if (result.error) {
          showModal(result.error, null)
          return
        }

        page.setData({'feed.favorited': false})
        const [pagePre] = getCurrentPages().slice(-2)
        for (const [feedsIndex, feeds] of pagePre.data.feeds_arr.entries()) {
          for (const [feedIndex, feed] of feeds.entries()) {
            if (feed.id === page.data.feed.id) {
              pagePre.setData({[`feeds_arr[${feedsIndex}][${feedIndex}].favorited`]: false})
              vibrate()
              return
            }
          }
        }
      })
      .catch(error => showModal(error.errMsg))
  } else {
    ff.postPromise('/favorites/create/' + page.data.feed.id)
      .then(result => {
        if (result.error) {
          showModal(result.error, null)
          return
        }

        page.setData({'feed.favorited': true})
        const [pagePre] = getCurrentPages().slice(-2)
        for (const [feedsIndex, feeds] of pagePre.data.feeds_arr.entries()) {
          for (const [feedIndex, feed] of feeds.entries()) {
            if (feed.id === page.data.feed.id) {
              pagePre.setData({[`feeds_arr[${feedsIndex}][${feedIndex}].favorited`]: true})
              vibrate()
              return
            }
          }
        }
      })
      .catch(error => showModal(error.errMsg))
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
                vibrate()
                return
              }
            }
          }
        }
      })
    })
    .catch(error => showModal(error.errMsg))
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
            vibrate()
            return
          }
        }
      }
    })
    .catch(error => showModal(error.errMsg))
}

function destroyMessage (page, id) {
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
            vibrate()
            return
          }
        }
      }
    })
    .catch(error => showModal(error.errMsg))
}

function postMessage (parameter, page) {
  page.setData({posting: true})
  ff.postPromise('/direct_messages/new', parameter)
    .then(result => {
      page.setData({posting: false})
      if (result.error) {
        showModal(result.error)
        return
      }

      wx.showToast({title: i18n.compose.sent, image: '/assets/toast_reply.png', duration: 900})
      const [message] = page.data.feeds_arr
      message.unshift(result)
      page.setData({
        param: null,
        photoPaths: null,
        'feeds_arr[0]': message
      })

      vibrate()
    })
    .catch(error => {
      page.setData({posting: false})
      showModal(error.errMsg)
    })
}

function post (page, para, photoPaths, success) {
  const parameter = Object.assign({format: 'html'}, para)
  page.setData({posting: true})
  if (photoPaths) {
    _postPhoto(page, parameter, photoPaths, success)
  } else {
    _postText(page, parameter, success)
  }
}

function _postText (page, parameter, success) {
  const direct = !(parameter.repost_status_id || parameter.in_reply_to_status_id || success)
  const image = parameter.repost_status_id ?
    '/assets/toast_repost.png' : (parameter.in_reply_to_status_id ?
      '/assets/toast_reply.png' : '/assets/toast_post.png')
  const title = parameter.repost_status_id ?
    i18n.feed.reposted : (parameter.in_reply_to_status_id ?
      i18n.feed.replied : i18n.feed.published)
  ff.postPromise('/statuses/update', parameter)
    .then(result => {
      page.setData({posting: false})
      if (result.error) {
        showModal(result.error)
        return
      }

      if (direct) {
        wx.switchTab({
          url: '/pages/home/home',
          success: () => {
            wx.showToast({title, image, duration: 900})
            _loadFeedThenAddToHome(result.id)
          }
        })
      } else {
        wx.showToast({title, image, duration: 900})
        if (parameter.in_reply_to_status_id) {
          _loadFeedThenAddToReply(result.id)
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
    .catch(error => {
      page.setData({posting: false})
      showModal(error.errMsg)
    })
}

function _postPhoto (page, parameter, photoPaths, success) {
  const direct = !(parameter.repost_status_id || parameter.in_reply_to_status_id)
  const title = i18n.feed.published
  const image = '/assets/toast_photo.png'
  ff.uploadPromise('/photos/upload', photoPaths, parameter)
    .then(result => {
      page.setData({posting: false})
      if (result.error) {
        showModal(result.error)
        return
      }

      if (direct) {
        wx.switchTab({
          url: '/pages/home/home',
          success: () => {
            wx.showToast({title, image, duration: 900})
            _loadFeedThenAddToHome(result.id)
          }
        })
      } else {
        wx.showToast({title, image, duration: 900})
        if (parameter.in_reply_to_status_id) {
          _loadFeedThenAddToReply(result.id)
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
    .catch(error => {
      page.setData({posting: false})
      showModal(error.errMsg)
    })
}

function updateAvatar (page, photoPaths) {
  const title = i18n.me.avatar_updated
  const image = '/assets/toast_done.png'
  ff.uploadPromise('/account/update_profile_image', photoPaths)
    .then(result => {
      if (result.error) {
        showModal(result.error)
        return
      }

      wx.showToast({title, image, duration: 900})
      const [currentPage] = getCurrentPages().slice(-1)
      if (currentPage.route === 'pages/profile/profile') {
        this.loadMe(currentPage)
      }
    })
    .catch(error => showModal(error.errMsg))
}

function updateProfile (page, parameter) {
  const title = i18n.me.profile_updated
  const image = '/assets/toast_done.png'
  ff.postPromise('/account/update_profile', parameter)
    .then(result => {
      if (result.error) {
        showModal(result.error)
        return
      }

      wx.navigateBack({
        complete () {
          wx.showToast({title, image, duration: 900})
        }
      })
    })
    .catch(error => showModal(error.errMsg))
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
      .then(result => {
        wx.stopPullDownRefresh()
        if (result.error) {
          showModal(result.error)
          return
        }

        const user = result
        page.setData({user}, () => {
          resolve(user)
        })
      })
      .catch(error => {
        if (error.message !== 'not authed') {
          showModal(error.errMsg || error.message)
        }
      })
  })
}

function showFeed (feed, id) {
  getApp().globalData.feed = feed
  this.navigateTo(`../feed/feed?id=${id || feed.id}`)
}

function showModal (error, title) {
  const para = {
    confirmColor: '#33a5ff',
    title: title || i18n.common.error,
    content: error,
    showCancel: false,
    confirmText: i18n.common.ok,
    cancelText: i18n.common.cancel
  }
  if (title === null) {
    delete para.title
  }

  if (!error) {
    delete para.content
  }

  wx.showModal(para)
}

function loadFeed (page, id) {
  ff.getPromise('/statuses/show', {id, format: 'html'})
    .then(result => {
      wx.stopPullDownRefresh()
      if (result.error) {
        wx.showModal({
          confirmColor: '#33a5ff',
          title: i18n.common.error,
          content: result.error,
          showCancel: false,
          confirmText: i18n.common.ok,
          success: () => {
            wx.navigateBack()
          }
        })
        return
      }

      page.setData({feed: result})
    })
    .catch(error => {
      if (error.message !== 'not authed') {
        showModal(error.errMsg || error.message)
      }
    })
}

function _loadFeedThenAddToHome (id) {
  ff.getPromise('/statuses/show', {id, format: 'html'})
    .then(result => {
      if (result.error) {
        return
      }

      const [page] = getCurrentPages()
      if (page.route === 'pages/home/home') {
        const [feeds] = page.data.feeds_arr
        feeds.unshift(result)
        page.setData({'feeds_arr[0]': feeds})
      }
    })
    .catch(error => showModal(error.errMsg))
}

function _loadFeedThenAddToReply (id) {
  ff.getPromise('/statuses/show', {id, format: 'html'})
    .then(result => {
      if (result.error) {
        return
      }

      const [page] = getCurrentPages().slice(-1)
      if (page.route === 'pages/feed/feed') {
        const [feeds] = page.data.feeds_arr
        feeds.push(result)
        page.setData({'feeds_arr[0]': feeds})
      }
    })
    .catch(error => showModal(error.errMsg))
}

function getAts (status) {
  const fanfouId = getApp().globalData.account.user.id
  const ats = []
  ats.push(`@${status.user.name}`)
  for (const item of status.txt) {
    if (item.type === 'at' && item.id !== fanfouId) {
      ats.push(item.text)
    }
  }

  return [...(new Set(ats))].join(' ') + ' '
}

function getUsers (status) {
  const fanfouId = getApp().globalData.account.user.id
  const users = []
  for (const item of status.txt) {
    if (item.type === 'at' && item.id !== fanfouId) {
      users.push(item)
    }
  }

  return [...(new Set(users))]
}

function loadMe (page) {
  ff.loadMePromise(getApp().globalData.account.tokens)
    .then(result => {
      wx.stopPullDownRefresh()
      if (result.error) {
        showModal(result.error)
        return
      }

      page.setData({user: result.user})
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
    .then(result => {
      if (result.error) {
        showModal(result.error, null)
        return
      }

      page.setData({
        'relationship.following': true,
        buttonPop: null
      })

      vibrate()
    })
    .catch(error => showModal(error.errMsg))
}

function unfollow (user, page) {
  wx.showActionSheet({
    itemList: [i18n.me.unfollow],
    success (result) {
      if (!result.cancel) {
        ff.postPromise('/friendships/destroy', {id: user.id})
          .then(() => {
            page.setData({
              'relationship.following': false,
              buttonPop: null
            })

            vibrate()
          })
          .catch(error => showModal(error.errMsg))
      }
    }
  })
}

function block (user, page) {
  wx.showActionSheet({
    itemList: [i18n.me.block],
    success (result) {
      if (!result.cancel) {
        ff.postPromise('/blocks/create', {id: user.id})
          .then(() => {
            page.setData({
              'relationship.blocking': true,
              'relationship.following': false,
              'relationship.followed_by': false
            })

            vibrate()
          })
          .catch(error => showModal(error.errMsg))
      }
    }
  })
}

function unblock (user, page) {
  wx.showActionSheet({
    itemList: [i18n.me.unblock],
    success (result) {
      if (!result.cancel) {
        ff.postPromise('/blocks/destroy', {id: user.id})
          .then(() => {
            page.setData({'relationship.blocking': false})
            vibrate()
          })
          .catch(error => showModal(error.errMsg))
      }
    }
  })
}

function relationship (targetId, page) {
  ff.getPromise('/friendships/show', {
    source_id: getApp().globalData.account.user.id,
    target_id: targetId
  })
    .then(result => {
      if (result.error) {
        showModal(result.error)
        return
      }

      page.setData({
        relationship: {
          following: result.relationship.source.following === 'true',
          followed_by: result.relationship.source.followed_by === 'true',
          blocking: result.relationship.source.blocking === 'true'
        }
      })
    })
    .catch(error => showModal(error.errMsg))
}

function accept (user, page) {
  ff.postPromise('/friendships/accept', {id: user.unique_id})
    .then(result => {
      if (result.error) {
        showModal(result.error)
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

      vibrate()
    })
    .catch(error => showModal(error.errMsg))
}

function deny (user, page) {
  ff.postPromise('/friendships/deny', {id: user.unique_id})
    .then(result => {
      if (result.error) {
        showModal(result.error)
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

      vibrate()
    })
    .catch(error => showModal(error.errMsg))
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
  postMsg: postMessage,
  destroyMsg: destroyMessage,
  updateAvatar,
  updateProfile,
  destroyForTest
}
