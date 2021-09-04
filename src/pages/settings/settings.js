const i18n = require('../../i18n/index')
const ff = require('../../utils/fanfou')
const {getSettings} = require('../../utils/util')
const audio = require('../../utils/audio')

const {statusBarHeight} = wx.getSystemInfoSync()
const {
  showTimeago,
  showSource,
  timelineCount,
  hideBlocks,
  timelineAudio,
  vibrate,
} = getSettings()

const fetchStatus = () =>
  new Promise((resolve) => {
    ff.getPromise('/account/verify_credentials').then((user) => {
      const {status = {id: '_k0GYlD6yhM'}} = user
      ff.getPromise('/statuses/show', {id: status.id, format: 'html'}).then(
        resolve,
      )
    })
  })

const updateSettings = (settings) => {
  const previousSettings = getSettings()
  settings = Object.assign(previousSettings, settings)
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
    timelineAudio,
    vibrate,
  },

  onShow() {
    const settings = getSettings()
    this.setData(settings)
  },

  onLoad() {
    fetchStatus().then((feed) => {
      this.setData({feed})
    })
  },

  onTimeagoChange(event) {
    const {value: showTimeago} = event.detail
    this.setData({showTimeago})
    updateSettings({showTimeago})
  },

  onSourceChange(event) {
    const {value: showSource} = event.detail
    this.setData({showSource})
    updateSettings({showSource})
  },

  onStatusCountChange(event) {
    const {value: timelineCount} = event.detail
    this.setData({timelineCount})
    updateSettings({timelineCount})
  },

  onBlocksChange(event) {
    const {value: hideBlocks} = event.detail
    this.setData({hideBlocks})
    updateSettings({hideBlocks})
  },

  onTimelineAudioChange(event) {
    const {value: timelineAudio} = event.detail
    this.setData({timelineAudio}, () => {
      if (timelineAudio) {
        audio.bubble()
      }
    })
    updateSettings({timelineAudio})
  },

  onVibrateChange(event) {
    const {value: vibrate} = event.detail
    this.setData({vibrate})
    updateSettings({vibrate})
  },
})
