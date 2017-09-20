const ff = require('../utils/fanfou')

const { TIMELINE_COUNT } = require('../config/fanfou')

function loadMore (page, url, para) {
  if (page.isloadingmore) {
    return
  }
  page.isloadingmore = true

  const param = Object.assign({
    count: TIMELINE_COUNT,
    max_id: page.data.feeds_arr.slice(-1)[0].slice(-1)[0].id,
    format: 'html',
    mode: 'lite'
  }, para)

  ff.getPromise(url || '/statuses/home_timeline', param)
    .then(res => {
      page.isloadingmore = false
      page.setData({
        ['feeds_arr[' + page.data.feeds_arr.length + ']']: res.obj
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
    format: 'html',
    mode: 'lite'
  }, para)

  ff.getPromise(url || '/statuses/home_timeline', param)
    .then(res => {
      wx.stopPullDownRefresh()
      page.isloadingmore = false // 防止刷不出来更多，在这里重置下
      page.setData({
        hideLoader: true,
        feeds_arr: [res.obj] // 清空了全部，todo 只加载最新
      })
      if (typeof completion === 'function') completion(page)
    })
    .catch(err => {
      console.error(err)
      if (typeof completion === 'function') completion(page)
    })
}

function show (id, page) {
  ff.getPromise('/statuses/show', { id: id, format: 'html', mode: 'lite' })
    .then(res => {
      wx.stopPullDownRefresh()
      res.obj.isme = res.obj.user.unique_id === getApp().globalData.account.user.unique_id
      page.setData({
        feed: res.obj,
        feeds: [res.obj]
      })
    })
    .catch(err => console.error(err))
}

function favoriteChange (page) {
  if (page.data.feed.favorited) {
    ff.postPromise('/favorites/destroy/' + page.data.feed.id)
      .then(res => {
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
      .then(res => {
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
  ff.postPromise('/statuses/destroy', { id: id })
    .then(res => {
      wx.navigateBack({
        complete: function () {
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
                page.setData({
                  [`feeds_arr[${feedsIndex}][${feedIndex}].id`]: null
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
  const image = photoPaths
    ? '/assets/toast_photo.png' : param.repost_status_id
    ? '/assets/toast_repost.png' : param.in_reply_to_status_id
    ? '/assets/toast_reply.png' : '/assets/toast_post.png'
  const title = photoPaths
    ? '已发布' : param.repost_status_id
    ? '已转发' : param.in_reply_to_status_id
    ? '已回复' : '已发布'
  if (photoPaths) {
    ff.uploadPromise(photoPaths, param)
      .then(res => {
        if (direct) {
          wx.switchTab({
            url: '/pages/home/home',
            success: () => {
              wx.showToast({
                title: title,
                image: image,
                duration: 500
              })
            }
          })
        } else {
          wx.showToast({
            title: title,
            image: image,
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
        if (direct) {
          wx.switchTab({
            url: '/pages/home/home',
            success: () => {
              wx.showToast({
                title: title,
                image: image,
                duration: 500
              })
            }
          })
        } else {
          wx.showToast({
            title: title,
            image: image,
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

function showUser (user) {
  user.isme = user.unique_id === getApp().globalData.account.user.unique_id
  getApp().globalData.user = user
  wx.navigateTo({
    url: `../userprofile/userprofile?id=${user.id}`
  })
}

function showFeed (feed) {
  feed.isme = feed.user.unique_id === getApp().globalData.account.user.unique_id
  getApp().globalData.feed = feed
  wx.navigateTo({
    url: `../feed/feed?id=${feed.id}`
  })
}

function getAts (status) {
  const fanfouId = getApp().globalData.account.user.id
  let ats = []
  ats.push(`@${status.user.name}`)
  status.txt.forEach(item => {
    if (item.type === 'at' && item.id !== fanfouId) ats.push(item.text)
  })
  return [...(new Set(ats))].join(' ') + ' '
}

module.exports.load = load
module.exports.loadMore = loadMore
module.exports.show = show
module.exports.destroy = destroy
module.exports.post = post
module.exports.load = load
module.exports.getAts = getAts
module.exports.favoriteChange = favoriteChange
module.exports.showUser = showUser
module.exports.showFeed = showFeed
module.exports.showImage = showImage
