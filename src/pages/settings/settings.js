'use strict'

const i18n = require('../../i18n/index')
const ff = require('../../utils/fanfou')
const {getSettings} = require('../../utils/util')

const {statusBarHeight} = wx.getSystemInfoSync()
const {showTimeago, showSource, timelineCount, hideBlocks} = getSettings()

const fetchStatus = async () => {
  const user = await ff.getPromise('/account/verify_credentials')
  return ff.getPromise('/statuses/show', {id: user.status.id, format: 'html'})
}

const updateSettings = settings => {
  const prevSettings = getSettings()
  settings = Object.assign(prevSettings, settings)
  wx.setStorageSync('settings', settings)
}

Page({
  data: {
    i18n,
    statusBarHeight,
    showTimeago,
    showSource,
    timelineCount,
    hideBlocks
  },

  onShow () {
    this.setData({...getSettings()})
  },

  async onLoad () {
    const feed = await fetchStatus()
    this.setData({feed})
  },

  onTimeagoChange (e) {
    const {value: showTimeago} = e.detail
    this.setData({showTimeago})
    updateSettings({showTimeago})
  },

  onSourceChange (e) {
    const {value: showSource} = e.detail
    this.setData({showSource})
    updateSettings({showSource})
  },

  onStatusCountChange (e) {
    const {value: timelineCount} = e.detail
    this.setData({timelineCount})
    updateSettings({timelineCount})
  },

  onBlocksChange (e) {
    const {value: hideBlocks} = e.detail
    this.setData({hideBlocks})
    updateSettings({hideBlocks})
  }
})
