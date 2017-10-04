const ff = require('../utils/fanfou')
const tab = require('../components/tab')

const {TIMELINE_COUNT} = require('../config/fanfou')

function loadMore (page, url, para) {
  const maxId = page.data.feeds_arr.slice(-1)[0].slice(-1)[0].id
  if (page.noMore || page.data.showLoader || !maxId) {
    return
  }
  page.setData({showLoader: true})
  const param = Object.assign({
    count: TIMELINE_COUNT,
    format: 'html'
  }, para)
  if (
    url === '/favorites' ||
    url === '/users/friends' ||
    url === '/users/followers' ||
    url === '/direct_messages/conversation_list'
  ) {
    param.page = page.data.feeds_arr.length + 1
  } else {
    param.max_id = maxId
  }
  ff.getPromise(url || '/statuses/home_timeline', param)
    .then(res => {
      page.setData({
        showLoader: false,
        ['feeds_arr[' + page.data.feeds_arr.length + ']']: res
      })
      if (res.length > 0 && maxId === res[0].id) {
        res.shift() // 饭否图片 timeline api 在使用 max_id 时有第 1 条消重复息的 bug，在这里移除
        param.count -= 1
      }
      page.noMore = res.length < param.count
      if (page.noMore) {
        wx.showToast({title: '没有更多了', image: '/assets/toast_blank.png', duration: 900})
      }
    })
    .catch(err => {
      page.setData({showLoader: false})
      console.error(err)
    })
}

function load (page, url, para) {
  page.setData({showLoader: true})
  const param = Object.assign({
    count: TIMELINE_COUNT,
    format: 'html'
  }, para)
  ff.getPromise(url || '/statuses/home_timeline', param)
    .then(res => {
      page.setData({
        showLoader: false,
        feeds_arr: [res]
      })
      wx.stopPullDownRefresh()
      page.noMore = res.length < param.count
      if (url === '/statuses/mentions') {
        tab.clearNotis('mentions')
      }
    })
    .catch(err => {
      console.error(err)
      page.setData({showLoader: false})
    })
}

function favoriteChange (page) {
  if (page.data.feed.favorited) {
    ff.postPromise('/favorites/destroy/' + page.data.feed.id)
      .then(() => {
        page.setData({'feed.favorited': false})
      })
      .catch(err => {
        wx.showToast({
          title: '错误',
          image: '/assets/toast_fail.png',
          duration: 900
        })
        console.error(err)
      })
  } else {
    ff.postPromise('/favorites/create/' + page.data.feed.id)
      .then(() => {
        page.setData({'feed.favorited': true})
      })
      .catch(err => {
        wx.showToast({
          title: '错误',
          image: '/assets/toast_fail.png',
          duration: 900
        })
        console.error(err)
      })
  }
}

function destroy (id) {
  ff.postPromise('/statuses/destroy', {id})
    .then(() => {
      wx.navigateBack({
        complete () {
          wx.showToast({
            title: '已删除',
            image: '/assets/toast_delete.png',
            duration: 900
          })
          const page = getCurrentPages().slice(-2)[0]
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
    .catch(err => {
      wx.showToast({
        title: '错误',
        image: '/assets/toast_fail.png',
        duration: 900
      })
      console.error(err)
    })
}

function destroyMsg (page, id) {
  ff.postPromise('/direct_messages/destroy', {id})
    .then(() => {
      wx.showToast({
        title: '已删除',
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
    .catch(err => {
      wx.showToast({
        title: '错误',
        image: '/assets/toast_fail.png',
        duration: 900
      })
      console.error(err)
    })
}

function postMsg (param, page) {
  page.setData({posting: true})
  ff.postPromise('/direct_messages/new', param)
    .then(res => {
      page.setData({posting: false})
      console.log(res)
      if (res.error) {
        wx.showToast({title: '发送失败', image: '/assets/toast_fail.png', duration: 900})
        return
      }
      wx.showToast({title: '已发送', image: '/assets/toast_reply.png', duration: 900})
      const message = page.data.feeds_arr[0]
      message.unshift(res)
      page.setData({
        param: null,
        photoPaths: null,
        'feeds_arr[0]': message
      })
    })
    .catch(err => {
      page.setData({posting: false})
      wx.showToast({title: '错误', image: '/assets/toast_fail.png', duration: 900})
      console.error(err)
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
  '已转发' : param.in_reply_to_status_id ?
  '已回复' : '已发布'
  ff.postPromise('/statuses/update', param)
    .then(res => {
      page.setData({posting: false})
      if (res.error) {
        wx.showToast({title: '发送失败', image: '/assets/toast_fail.png', duration: 900})
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
        _loadFeedThenAddToReply(res.id)
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
      wx.showToast({title: '错误', image: '/assets/toast_fail.png', duration: 900})
      console.error(err)
    })
}

function _postPhoto (page, param, photoPaths, success) {
  const direct = !(param.repost_status_id || param.in_reply_to_status_id)
  const title = '已发布'
  const image = '/assets/toast_photo.png'
  ff.uploadPromise('/photos/upload', photoPaths, param)
    .then(res => {
      page.setData({posting: false})
      if (res.error) {
        wx.showModal({
          confirmColor: '#33a5ff',
          content: res.error,
          showCancel: false,
          confirmText: '好的'
        })
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
        _loadFeedThenAddToReply(res.id)
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
      wx.showToast({title: '错误', image: '/assets/toast_fail.png', duration: 900})
      console.error(err)
    })
}

function updateAvatar (page, photoPaths) {
  const title = '已更新头像'
  const image = '/assets/toast_done.png'
  ff.uploadPromise('/account/update_profile_image', photoPaths)
    .then(res => {
      if (res.error) {
        wx.showModal({
          confirmColor: '#33a5ff',
          content: res.error,
          showCancel: false,
          confirmText: '好的'
        })
        return
      }
      wx.showToast({title, image, duration: 900})
      const currentPage = getCurrentPages().slice(-1)[0]
      if (currentPage.route === 'pages/profile/profile') {
        this.loadMe(currentPage)
      }
    })
    .catch(err => {
      wx.showToast({title: '错误', image: '/assets/toast_fail.png', duration: 900})
      console.error(err)
    })
}

function updateProfile (page, param) {
  const title = '已更新资料'
  const image = '/assets/toast_done.png'
  ff.postPromise('/account/update_profile', param)
    .then(res => {
      if (res.error) {
        wx.showModal({
          confirmColor: '#33a5ff',
          content: res.error,
          showCancel: false,
          confirmText: '好的'
        })
        return
      }
      wx.navigateBack({
        complete () {
          wx.showToast({title, image, duration: 900})
        }
      })
    })
    .catch(err => {
      wx.showToast({title: '错误', image: '/assets/toast_fail.png', duration: 900})
      console.error(err)
    })
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
  ff.getPromise('/users/show', {id, format: 'html'})
    .then(res => {
      wx.stopPullDownRefresh()
      const user = res
      page.setData({user})
    })
    .catch(err => console.error(err))
}

function showFeed (feed, id) {
  getApp().globalData.feed = feed
  this.navigateTo(`../feed/feed?id=${id || feed.id}`)
}

function loadFeed (page, id) {
  ff.getPromise('/statuses/show', {id, format: 'html'})
    .then(res => {
      if (res.error) {
        console.log(res)
        wx.showModal({
          confirmColor: '#33a5ff',
          content: res.error,
          showCancel: false,
          confirmText: '好的'
        })
      }
      wx.stopPullDownRefresh()
      page.setData({feed: res})
    })
    .catch(err => console.error(err))
}

function _loadFeedThenAddToHome (id) {
  ff.getPromise('/statuses/show', {id, format: 'html'})
    .then(res => {
      if (res.error) {
        return
      }
      const page = getCurrentPages().slice(-1)[0]
      if (page.route === 'pages/home/home') {
        const feeds = page.data.feeds_arr[0]
        feeds.unshift(res)
        page.setData({'feeds_arr[0]': feeds})
      }
    })
    .catch(err => console.error(err))
}

function _loadFeedThenAddToReply (id) {
  ff.getPromise('/statuses/show', {id, format: 'html'})
    .then(res => {
      if (res.error) {
        return
      }
      const page = getCurrentPages().slice(-1)[0]
      if (page.route === 'pages/feed/feed') {
        const feeds = page.data.feeds_arr[0]
        feeds.push(res)
        page.setData({'feeds_arr[0]': feeds})
      }
    })
    .catch(err => console.error(err))
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

function loadMe (page) {
  ff.loadMePromise(getApp().globalData.account.tokens)
    .then(res => {
      wx.stopPullDownRefresh()
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
        wx.showModal({
          confirmColor: '#33a5ff',
          content: res.error,
          showCancel: false,
          confirmText: '好的'
        })
      } else {
        page.setData({'relationship.following': true})
      }
    })
    .catch(err => console.error(err))
}

function unfollow (user, page) {
  wx.showActionSheet({
    itemList: ['取消关注'],
    success (res) {
      if (!res.cancel) {
        ff.postPromise('/friendships/destroy', {id: user.id})
          .then(() => {
            page.setData({'relationship.following': false})
          })
          .catch(err => console.error(err))
      }
    }
  })
}

function block (user, page) {
  wx.showActionSheet({
    itemList: ['拉黑'],
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
          .catch(err => console.error(err))
      }
    }
  })
}

function unblock (user, page) {
  ff.postPromise('/blocks/destroy', {id: user.id})
    .then(() => {
      page.setData({'relationship.blocking': false})
    })
    .catch(err => console.error(err))
}

function relationship (targetId, page) {
  ff.getPromise('/friendships/show', {
    source_id: getApp().globalData.account.user.id,
    target_id: targetId
  }).then(res => {
    page.setData({
      relationship: {
        following: res.relationship.source.following === 'true',
        followed_by: res.relationship.source.followed_by === 'true',
        blocking: res.relationship.source.blocking === 'true'
      }
    })
  }).catch(err => console.error(err))
}

function accept (user, page) {
  ff.postPromise('/friendships/accept', {id: user.unique_id})
    .then(res => {
      if (res.error) {
        wx.showModal({
          confirmColor: '#33a5ff',
          content: res.error,
          showCancel: false,
          confirmText: '好的'
        })
      } else {
        console.log(res)
        for (const [feedsIndex, feeds] of page.data.feeds_arr.entries()) {
          for (const [feedIndex, feed] of feeds.entries()) {
            if (feed.unique_id === user.unique_id) {
              page.setData({[`feeds_arr[${feedsIndex}][${feedIndex}].accept`]: true})
              return
            }
          }
        }
      }
    })
    .catch(err => console.error(err))
}

function deny (user, page) {
  ff.postPromise('/friendships/deny', {id: user.unique_id})
    .then(res => {
      if (res.error) {
        wx.showModal({
          confirmColor: '#33a5ff',
          content: res.error,
          showCancel: false,
          confirmText: '好的'
        })
      } else {
        console.log(res)
        for (const [feedsIndex, feeds] of page.data.feeds_arr.entries()) {
          for (const [feedIndex, feed] of feeds.entries()) {
            if (feed.unique_id === user.unique_id) {
              page.data.feeds_arr[feedsIndex].splice(feedIndex, 1)
              page.setData({[`feeds_arr[${feedsIndex}]`]: page.data.feeds_arr[feedsIndex]})
              return
            }
          }
        }
      }
    })
    .catch(err => console.error(err))
}

module.exports.load = load
module.exports.loadMore = loadMore
module.exports.destroy = destroy
module.exports.post = post
module.exports.load = load
module.exports.getAts = getAts
module.exports.favoriteChange = favoriteChange
module.exports.showUser = showUser
module.exports.showFeed = showFeed
module.exports.showImage = showImage
module.exports.loadMe = loadMe
module.exports.loadUser = loadUser
module.exports.loadFeed = loadFeed
module.exports.follow = follow
module.exports.unfollow = unfollow
module.exports.navigateTo = navigateTo
module.exports.relationship = relationship
module.exports.block = block
module.exports.unblock = unblock
module.exports.accept = accept
module.exports.deny = deny
module.exports.postMsg = postMsg
module.exports.destroyMsg = destroyMsg
module.exports.updateAvatar = updateAvatar
module.exports.updateProfile = updateProfile
