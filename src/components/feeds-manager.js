const ff = require('../utils/fanfou')

const {TIMELINE_COUNT} = require('../config/fanfou')

function loadMore (page, url, para) {
  if (page.isloadingmore) {
    return
  }
  page.isloadingmore = true
  const maxId = page.data.feeds_arr.slice(-1)[0].slice(-1)[0].id
  const param = Object.assign({
    count: TIMELINE_COUNT,
    format: 'html'
  }, para)
  if (url === '/favorites' || url === '/users/friends' || url === '/users/followers') {
    param.page = page.data.feeds_arr.length + 1
  } else {
    param.max_id = maxId
  }
  ff.getPromise(url || '/statuses/home_timeline', param)
    .then(res => {
      page.isloadingmore = false
      if (res.length > 0 && maxId === res[0].id) {
        res.shift() // 饭否图片 timeline api 在使用 max_id 时有第 1 条消重复息的 bug，在这里移除
      }
      if (res.length === 0) {
        wx.showToast({
          title: '没有了',
          image: '/assets/toast_blank.png',
          duration: 500
        })
        page.setData({
          hideLoader: true
        })
        return
      }
      page.setData({
        ['feeds_arr[' + page.data.feeds_arr.length + ']']: res
      })
    })
    .catch(err => {
      page.isloadingmore = false
      console.error(err)
    })
}

function load (page, url, para, completion) {
  const param = Object.assign({
    count: TIMELINE_COUNT,
    format: 'html'
  }, para)
  ff.getPromise(url || '/statuses/home_timeline', param)
    .then(res => {
      wx.stopPullDownRefresh()
      page.isloadingmore = false // 防止刷不出来更多，在这里重置下
      page.setData({
        hideLoader: false, // 由于清空了全部，要重置加载更多标记
        feeds_arr: [res] // 清空了全部，todo 只加载最新
      })
      if (typeof completion === 'function') {
        completion(page)
      }
    })
    .catch(err => {
      console.error(err)
      if (typeof completion === 'function') {
        completion(page)
      }
    })
}

function favoriteChange (page) {
  if (page.data.feed.favorited) {
    ff.postPromise('/favorites/destroy/' + page.data.feed.id)
      .then(() => {
        page.setData({
          'feed.favorited': false
        })
      })
      .catch(err => {
        wx.showToast({
          title: '错误',
          image: '/assets/toast_fail.png',
          duration: 500
        })
        console.error(err)
      })
  } else {
    ff.postPromise('/favorites/create/' + page.data.feed.id)
      .then(() => {
        page.setData({
          'feed.favorited': true
        })
      })
      .catch(err => {
        wx.showToast({
          title: '错误',
          image: '/assets/toast_fail.png',
          duration: 500
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
            duration: 500
          })
          // 模拟器和 iOS 不一样，模拟器转场快 -1 生效，iOS 转场慢 -2 生效，待测试 Android
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
        duration: 500
      })
      console.error(err)
    })
}

function post (param, photoPaths, page, direct) {
  wx.showLoading({
    title: '正在发送',
    mask: true
  })
  const image = photoPaths ?
    '/assets/toast_photo.png' : param.repost_status_id ?
    '/assets/toast_repost.png' : param.in_reply_to_status_id ?
    '/assets/toast_reply.png' : '/assets/toast_post.png'
  const title = photoPaths ?
    '已发布' : param.repost_status_id ?
    '已转发' : param.in_reply_to_status_id ?
    '已回复' : '已发布'
  if (photoPaths) {
    ff.uploadPromise(photoPaths, param)
      .then(res => {
        if (res.error) {
          wx.hideLoading()
          wx.showModal({
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
              wx.showToast({
                title,
                image,
                duration: 500
              })
            }
          })
        } else {
          wx.showToast({
            title,
            image,
            duration: 500
          })
        }
        page.setData({
          param: null,
          photoPaths: null
        })
      })
      .catch(err => {
        wx.showToast({
          title: '错误',
          image: '/assets/toast_fail.png',
          duration: 500
        })
        console.error(err)
      })
  } else {
    ff.postPromise('/statuses/update', param)
      .then(res => {
        if (res.error) {
          wx.showToast({
            title: '发送失败',
            image: '/assets/toast_fail.png',
            duration: 500
          })
          return
        }
        if (direct) {
          wx.switchTab({
            url: '/pages/home/home',
            success: () => {
              wx.showToast({
                title,
                image,
                duration: 500
              })
            }
          })
        } else {
          wx.showToast({
            title,
            image,
            duration: 500
          })
        }
        page.setData({
          param: null,
          photoPaths: null
        })
      })
      .catch(err => {
        wx.showToast({
          title: '错误',
          image: '/assets/toast_fail.png',
          duration: 500
        })
        console.error(err)
      })
  }
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

function loadFeed (id, page) {
  ff.getPromise('/statuses/show', {id, format: 'html'})
    .then(res => {
      wx.stopPullDownRefresh()
      page.setData({
        feed: res,
        feeds: [res]
      })
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
          content: `已向 ${user.name} 发出关注请求，请等待确认。`,
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
            page.setData({'relationship.blocking': true})
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
