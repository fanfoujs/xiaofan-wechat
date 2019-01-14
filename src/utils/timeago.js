'use strict'

const i18n = require('../i18n/index')
const timeago = require('./fanfou-sdk-node/modules/timeago/timeago')

// 本地化的字典样式
const fanfouWeAppDict = function (number, index) {
  return i18n.timeago[index]
}

timeago.register('fanfou_weapp', fanfouWeAppDict)

function updateTimeAgo (feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].time_ago = timeago().format(feeds[i].created_at, 'fanfou_weapp')
  }

  return feeds
}

module.exports = timeago
module.exports.updateTimeAgo = updateTimeAgo
