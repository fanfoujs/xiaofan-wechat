'use strict'

const ff = require('../utils/fanfou')

const {CONSUMER_KEY} = require('../config/fanfou')

function render () {
  const [page] = getCurrentPages().slice(-1)
  if (page) {
    page.setData({notis: getApp().globalData.notis})
  }
}

function updateNotis () {
  if (
    getApp() &&
    getApp().globalData &&
    getApp().globalData.account &&
    getApp().globalData.account.consumer_key === CONSUMER_KEY
  ) {
    render()
    ff.getPromise('/account/notification').then(res => {
      getApp().globalData.notis = res
      render()
    })
    ff.getPromise('/blocks/blocking').then(res => {
      wx.setStorage({key: 'blocks', data: res})
    })
    ff.getPromise('/blocks/ids').then(res => {
      wx.setStorage({key: 'blockIds', data: res})
    })
  }
}

function clearNotis (key) {
  getApp().globalData.notis[key] = 0
  render()
}

module.exports = {
  updateNotis,
  clearNotis
}
