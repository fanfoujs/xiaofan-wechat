'use strict'

const User = require('./user')

class DirectMessage {
  constructor (dm) {
    console.log(dm)
    this.id = dm.id
    this.text = dm.text
    this.sender_id = dm.sender_id
    this.recipient_id = dm.recipient_id
    this.create_at = dm.create_at
    this.sender_screen_name = dm.sender_screen_name
    this.recipient_screen_name = dm.recipient_screen_name
    this.sender = new User(dm.sender)
    this.recipient = new User(dm.recipient)
    if (dm.in_reply_to) {
      this.in_reply_to = new DirectMessage(dm.in_reply_to)
    }
  }
}

module.exports = DirectMessage
