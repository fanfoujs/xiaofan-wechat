'use strict'

const timeago = require('./fanfou-sdk-node/modules/timeago/timeago')

// 本地化的字典样式
let fanfouWeAppDict = function (number, index, totalSec) {
  // number：xxx 时间前 / 后的数字；
  // index：下面数组的索引号；
  // total_sec：时间间隔的总秒数；
  return [
    ['1 秒前', 'a while'],
    ['%s 秒前', 'in %s seconds'],
    ['1 分钟前', 'in 1 minute'],
    ['%s 分钟前', 'in %s minutes'],
    ['1 小时前', 'in 1 hour'],
    ['%s 小时前', 'in %s hours'],
    ['1 天前', 'in 1 day'],
    ['%s 天前', 'in %s days'],
    ['1 周前', 'in 1 week'],
    ['%s 周前', 'in %s weeks'],
    ['1 月前', 'in 1 month'],
    ['%s 月前', 'in %s months'],
    ['1 年前', 'in 1 year'],
    ['%s 年前', 'in %s years']
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
