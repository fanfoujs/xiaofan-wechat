const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const ff = require('../../utils/fanfou')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')

const url = '/statuses/public_timeline'
const {TIMELINE_COUNT} = require('../../config/fanfou')

const para = {count: TIMELINE_COUNT}

Page(extend({}, tap, {
  onLoad () {
    fm.load(this, url, para)
    this.loadTrendsAndSavedSearchesList()
  },
  onShow () {
    tab.updateNotis()
  },
  onPullDownRefresh () {
    fm.load(this, url, para)
    this.loadTrendsAndSavedSearchesList()
  },
  tapTxt () {},
  tapAvatar (e) {
    fm.showUser(e.currentTarget.dataset.user)
  },
  tapFeed (e) {
    fm.showFeed(e.currentTarget.dataset.feed)
  },
  loadTrendsAndSavedSearchesList () {
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
  search (e) {
    fm.navigateTo(`../feeds/feeds?q=${e.detail.value}`, () => {
      this.setData({
        value: null
      })
      for (const value of this.data.saved_searches) {
        if (value.query === e.detail.value) {
          return
        }
      }
      ff.postPromise('/saved_searches/create', {query: e.detail.value})
        .then(res => {
          this.setData({['saved_searches[' + this.data.saved_searches.length + ']']: res.res})
        })
        .catch(err => console.error(err))
    })
  },
  tapListItem (e) {
    fm.navigateTo(`../feeds/feeds?q=${e.currentTarget.dataset.query}`)
  },
  longpressListItem (e) {
    const that = this
    wx.showActionSheet({
      itemList: ['删除'],
      success (res) {
        if (!res.cancel) {
          ff.postPromise('/saved_searches/destroy', {id: e.currentTarget.dataset.id})
            .then(() => {})
            .catch(err => console.error(err))
          for (const [index, value] of that.data.saved_searches.entries()) {
            if (value.id === e.currentTarget.dataset.id) {
              that.data.saved_searches.splice(index, 1)
              that.setData({
                saved_searches: that.data.saved_searches
              })
              return
            }
          }
        }
      }
    })
  }
}))
