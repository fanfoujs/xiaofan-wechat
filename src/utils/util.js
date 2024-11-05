function formatTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map((x) => formatNumber(x)).join('/') +
    ' ' +
    [hour, minute, second].map((x) => formatNumber(x)).join(':')
  )
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getSettings() {
  const settings = wx.getStorageSync('settings') || {
    showTimeago: true,
    showSource: true,
    timelineCount: 30,
    hideBlocks: false,
    timelineAudio: true,
    vibrate: true,
  }
  return settings
}

function getBlocks() {
  const blocks = wx.getStorageSync('blocks') || []
  return blocks
}

function getBlockIds() {
  const blockIds = wx.getStorageSync('blockIds') || []
  return blockIds
}

module.exports = {
  formatTime,
  getSettings,
  getBlocks,
  getBlockIds,
}
