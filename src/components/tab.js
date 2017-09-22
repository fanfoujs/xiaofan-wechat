'use strict'

const {CONSUMER_KEY} = require('../config/fanfou')

const ff = require('../utils/fanfou')

function _render () {
  const page = getCurrentPages().slice(-1)[0]
  if (!page) {
    return
  }
  page.setData({
    notis: getApp().globalData.notis
  })
}

function renderNotis () {
  if (
    getApp() &&
    getApp().globalData &&
    getApp().globalData.account &&
    getApp().globalData.account.consumer_key === CONSUMER_KEY &&
    !getApp().globalData.notis
  ) {
    updateNotis()
  } else {
    _render()
  }
}

function updateNotis () {
  if (
    getApp() &&
    getApp().globalData &&
    getApp().globalData.account &&
    getApp().globalData.account.consumer_key === CONSUMER_KEY &&
    !getApp().globalData.notis
  ) {
    ff.getPromise('/account/notification').then(res => {
      getApp().globalData.notis = [0, res.res.mentions, 0, 0, 0]
      _render()
    })
  }
}

function clearNotis (index, value) {
  getApp().globalData.notis[index] = value
  _render()
}

module.exports.renderNotis = renderNotis
module.exports.updateNotis = updateNotis
module.exports.clearNotis = clearNotis
