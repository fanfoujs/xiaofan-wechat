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
  if (getApp() && !getApp().globalData.notis) {
    updateNotis()
  } else {
    _render()
  }
}

function updateNotis () {
  ff.getPromise('/account/notification').then(res => {
    // todo: implement other noti
    // getApp().globalData.notis = [0, res.res.mentions, 0, 0, res.res.direct_messages + res.res.friend_requests]
    getApp().globalData.notis = [0, res.res.mentions, 0, 0, 0]
    _render()
  })
}

function clearNotis (index, value) {
  getApp().globalData.notis[index] = value
  _render()
}

module.exports.renderNotis = renderNotis
module.exports.updateNotis = updateNotis
module.exports.clearNotis = clearNotis
