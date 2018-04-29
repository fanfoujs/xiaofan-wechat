function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber (n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getSettings () {
  const settings = wx.getStorageSync('settings') || {
    showTimeago: true,
    showSource: true,
    timelineCount: 30,
    hideBlocks: false
  }
  return settings
}

function getBlocks () {
  const blocks = wx.getStorageSync('blocks') || []
  return blocks
}

module.exports = {
  formatTime,
  getSettings,
  getBlocks
}
