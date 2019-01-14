const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const ff = require('../../utils/fanfou')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const network = require('../../mixins/network')
const i18n = require('../../i18n/index')
const {getSettings} = require('../../utils/util')

const url = '/statuses/public_timeline'

Page(extend({}, tap, {
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    settings: getSettings()
  },
  onLoad () {
    wx.setNavigationBarTitle({title: i18n.discover.title})
    this.setData({i18n})
    fm.load(this, url)
    this.loadTrendsAndSavedSearchesList()
    network.listen(this)
  },
  onShow () {
    tab.updateNotis()
    this.setData({settings: getSettings()})
  },
  onPullDownRefresh () {
    fm.load(this, url)
    this.loadTrendsAndSavedSearchesList()
  },
  loadTrendsAndSavedSearchesList () {
    ff.getPromise('/trends/list')
      .then(res => {
        const trends = res.trends.map(item => {
          return {
            name: item.name,
            query: item.query.trim().split('|').join(' | '),
            url: item.url
          }
        })
        this.setData({trends})
      })
      .catch(err => fm.showModal(err.errMsg))
    ff.getPromise('/saved_searches/list')
      .then(res => {
        this.setData({
          saved_searches: res
        })
      })
      .catch(err => fm.showModal(err.errMsg))
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
          this.setData({['saved_searches[' + this.data.saved_searches.length + ']']: res})
        })
        .catch(err => fm.showModal(err.errMsg))
    })
  },
  tapListItem (e) {
    fm.navigateTo(`../feeds/feeds?q=${e.currentTarget.dataset.query}`)
  },
  longpressListItem (e) {
    const page = this
    wx.showActionSheet({
      itemList: [i18n.common.delete],
      success (res) {
        if (!res.cancel) {
          ff.postPromise('/saved_searches/destroy', {id: e.currentTarget.dataset.id})
            .then(() => {})
            .catch(err => fm.showModal(err.errMsg))
          for (const [index, value] of page.data.saved_searches.entries()) {
            if (value.id === e.currentTarget.dataset.id) {
              page.data.saved_searches.splice(index, 1)
              page.setData({
                saved_searches: page.data.saved_searches
              })
              return
            }
          }
        }
      }
    })
  }
}))
