const tab = require('../../components/tab')
const fm = require('../../components/feeds-manager')
const ff = require('../../utils/fanfou')
const extend = require('../../utils/extend')
const tap = require('../../mixins/tap')
const network = require('../../mixins/network')
const i18n = require('../../i18n/index')
const {getSettings} = require('../../utils/util')

const url = '/statuses/public_timeline'

Page(
  extend({}, tap, {
    data: {
      statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
      settings: getSettings(),
    },
    onLoad() {
      wx.setNavigationBarTitle({title: i18n.discover.title})
      this.setData({i18n})
      fm.load(this, url)
      this.loadTrendsAndSavedSearchesList()
      network.listen(this)
    },
    onShow() {
      tab.updateNotis()
      this.setData({settings: getSettings()})
    },
    onPullDownRefresh() {
      fm.load(this, url)
      this.loadTrendsAndSavedSearchesList()
    },
    loadTrendsAndSavedSearchesList() {
      ff.getPromise('/trends/list')
        .then((result) => {
          const trends = result.trends.map((item) => ({
            name: item.name,
            query: item.query.trim().split('|').join(' | '),
            url: item.url,
          }))
          this.setData({trends})
        })
        .catch((error) => fm.showModal(error.errMsg))
      ff.getPromise('/saved_searches/list')
        .then((result) => {
          this.setData({
            saved_searches: result,
          })
        })
        .catch((error) => fm.showModal(error.errMsg))
    },
    search(event) {
      fm.navigateTo(`../feeds/feeds?q=${event.detail.value}`, () => {
        this.setData({
          value: null,
        })
        for (const value of this.data.saved_searches) {
          if (value.query === event.detail.value) {
            return
          }
        }

        ff.postPromise('/saved_searches/create', {query: event.detail.value})
          .then((result) => {
            this.setData({
              ['saved_searches[' + this.data.saved_searches.length + ']']:
                result,
            })
          })
          .catch((error) => fm.showModal(error.errMsg))
      })
    },
    tapListItem(event) {
      fm.navigateTo(`../feeds/feeds?q=${event.currentTarget.dataset.query}`)
    },
    longpressListItem(event) {
      const page = this
      wx.showActionSheet({
        itemList: [i18n.common.delete],
        success(result) {
          if (!result.cancel) {
            ff.postPromise('/saved_searches/destroy', {
              id: event.currentTarget.dataset.id,
            })
              .then(() => {})
              .catch((error) => fm.showModal(error.errMsg))
            for (const [index, value] of page.data.saved_searches.entries()) {
              if (value.id === event.currentTarget.dataset.id) {
                page.data.saved_searches.splice(index, 1)
                page.setData({
                  saved_searches: page.data.saved_searches,
                })
                return
              }
            }
          }
        },
      })
    },
  }),
)
