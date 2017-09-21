const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const ff = require('../../utils/fanfou')

const url = '/statuses/public_timeline'
const { TIMELINE_COUNT } = require('../../config/fanfou')
const para = { count: TIMELINE_COUNT }

Page({
  onLoad: function () {
    fm.load(this, url, para)
    this.loadTrendsAndSavedSearchesList()
  },
  onShow: function () {
    tab.renderNotis()
  },
  onPullDownRefresh: function () {
    fm.load(this, url, para)
    this.loadTrendsAndSavedSearchesList()
  },
  tapTxt: function (e) { },
  tapAvatar: function (e) {
    fm.showUser(e.currentTarget.dataset.user)
  },
  tapFeed: function (e) {
    fm.showFeed(e.currentTarget.dataset.feed)
  },
  loadTrendsAndSavedSearchesList: function () {
    ff.getPromise('/trends/list')
      .then(res => {
        this.setData({
          trends: res.res.trends
        })
      })
      .catch(err => console.error(err))
    ff.getPromise('/saved_searches/list')
      .then(res => {
        this.setData({
          saved_searches: res.res
        })
      })
      .catch(err => console.error(err))
  },
  search: function (e) {
    const that = this
    wx.navigateTo({
      url: `../feeds/feeds?q=${e.detail.value}`,
      success: function () {
        that.setData({
          value: null
        })
        for (const value of that.data.saved_searches) {
          if (value.query === e.detail.value) {
            return
          }
        }
        ff.postPromise('/saved_searches/create', { query: e.detail.value })
          .then(res => {
            that.setData({
              ['saved_searches[' + that.data.saved_searches.length + ']']: res.res
            })
          })
          .catch(err => console.error(err))
      }
    })
  },
  tapListItem: function (e) {
    wx.navigateTo({
      url: `../feeds/feeds?q=${e.currentTarget.dataset.query}`
    })
  },
  longpressListItem: function (e) {
    const that = this
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (res) {
        if (!res.cancel) {
          ff.postPromise('/saved_searches/destroy', { id: e.currentTarget.dataset.id })
            .then(res => {
              // todo 删除前端的话题
              for (const [index, value] of that.data.saved_searches.entries()) {
                if (value.id === e.currentTarget.dataset.id) {
                  that.setData({
                    ['saved_searches[' + index + ']']: {}
                  })
                  return
                }
              }
            })
            .catch(err => console.error(err))
        }
      }
    })
  }
})
