'use strict'

const timeago = require('../../timeago')
const dateFormat = require('../modules/date-format/index')
const User = require('./user')

class DirectMessage {
  constructor (dm) {
    this.id = dm.id
    this.text = dm.text
    this.sender_id = dm.sender_id
    this.recipient_id = dm.recipient_id
    this.created_at = dm.created_at
    this.sender_screen_name = dm.sender_screen_name
    this.recipient_screen_name = dm.recipient_screen_name
    this.sender = new User(dm.sender)
    this.recipient = new User(dm.recipient)
    if (dm.in_reply_to) {
      this.in_reply_to = new DirectMessage(dm.in_reply_to)
    }

    this.time_ago = this._getTimeAgo()
    this.time_tag = this._getTimeTag()
  }

  _getTimeAgo () {
    return timeago().format(this.created_at, 'fanfou_weapp')
  }

  _getTimeTag () {
    const date = new Date()
    const create = new Date(this.created_at)
    const nowYear = dateFormat('yyyy', date)
    const createYear = dateFormat('yyyy', create)
    const nowDate = dateFormat('yyyyMMdd', date)
    const createDate = dateFormat('yyyyMMdd', create)

    if (nowDate === createDate) {
      return dateFormat('hh:mm', create)
    }

    if (nowYear === createYear) {
      return dateFormat('MM/dd hh:mm', create)
    }

    return dateFormat('yyyy/MM/dd hh:mm', create)
  }
}

module.exports = DirectMessage
