'use strict'

const timeago = require('./fanfou-sdk-node/modules/timeago/timeago')

// 本地化的字典样式
const fanfouWeAppDict = function (number, index) {
  // Number：xxx 时间前 / 后的数字；
  // index：下面数组的索引号；
  // total_sec：时间间隔的总秒数；
  return [
    ['1 秒前', '刚刚'],
    ['%s 秒前', '%s 秒内'],
    ['1 分钟前', '1 分钟内'],
    ['%s 分钟前', '%s 分钟内'],
    ['1 小时前', '1 小时内'],
    ['%s 小时前', '%s 小时内'],
    ['1 天前', '1 天内'],
    ['%s 天前', '%s 天内'],
    ['1 周前', '1 周内'],
    ['%s 周前', '%s 周内'],
    ['1 月前', '1 个月内'],
    ['%s 月前', '%s 个月内'],
    ['1 年前', '1 年内'],
    ['%s 年前', '%s 年内']
  ][index]
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
