const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const ff = require('../../utils/fanfou')
const para = { count: 60 }
const url = '/statuses/public_timeline'

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
  tapTxt: function (e) {
    console.log(e.target.dataset.value)
  },
  tapAvatar: function (e) {
    fm.showUser(e.currentTarget.dataset.user)
  },
  tapFeed: function (e) {
    fm.showFeed(e.currentTarget.dataset.feed)
  },
  loadTrendsAndSavedSearchesList: function () {
    ff.getPromise('/trends/list')
      .then(res => {
        console.log(res.res.trends)
        this.setData({
          trends: res.res.trends
        })
      })
      .catch(err => console.error(err))
    ff.getPromise('/saved_searches/list')
      .then(res => {
        console.log(res.res.trends)
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
      }
    })
  },
  tapListItem: function (e) {
    wx.navigateTo({
      url: `../feeds/feeds?q=${e.currentTarget.dataset.query}`
    })
  }
})
