'use strict'

const i18n = require('../../i18n/index')
const ff = require('../../utils/fanfou')
const {getSettings} = require('../../utils/util')
const audio = require('../../utils/audio')

const {statusBarHeight} = wx.getSystemInfoSync()
const {showTimeago, showSource, timelineCount, hideBlocks, timelineAudio} = getSettings()

const fetchStatus = () => {
  return new Promise(resolve => {
    ff.getPromise('/account/verify_credentials')
      .then(user => {
        const {status = {id: '_k0GYlD6yhM'}} = user
        ff.getPromise('/statuses/show', {id: status.id, format: 'html'})
          .then(resolve)
      })
  })
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
    hideBlocks,
    timelineAudio
  },

  onShow () {
    const settings = getSettings()
    this.setData(settings)
  },

  onLoad () {
    fetchStatus().then(feed => {
      this.setData({feed})
    })
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
  },

  onTimelineAudioChange (e) {
    const {value: timelineAudio} = e.detail
    this.setData({timelineAudio}, () => {
      if (timelineAudio) {
        audio.bubble()
      }
    })
    updateSettings({timelineAudio})
  }
})
