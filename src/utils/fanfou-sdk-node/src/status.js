const he = require('../modules/he/he')
const timeago = require('../../timeago')
const dateFormat = require('../modules/date-format/index')
const User = require('./user')
const Photo = require('./photo')

class Status {
  constructor(status) {
    this.created_at = status.created_at
    this.id = status.id
    this.rawid = status.rawid
    this.text = status.text
    this.source = status.source
    this.truncated = status.truncated
    this.in_reply_to_status_id = status.in_reply_to_status_id
    this.in_reply_to_user_id = status.in_reply_to_user_id
    this.favorited = status.favorited
    this.in_reply_to_screen_name = status.in_reply_to_screen_name
    this.is_self = status.is_self
    this.location = status.location
    if (status.repost_status_id) {
      this.repost_status_id = status.repost_status_id
    }

    if (status.repost_user_id) {
      this.repost_user_id = status.repost_user_id
    }

    if (status.repost_screen_name) {
      this.repost_screen_name = status.repost_screen_name
    }

    if (status.repost_status) {
      this.repost_status = new Status(status.repost_status)
    }

    this.user = new User(status.user)
    if (status.photo) {
      this.photo = new Photo(status.photo)
    }

    this.type = this._getType()
    this.source_url = this._getSourceUrl()
    this.source_name = this._getSourceName()
    this.time_ago = this._getTimeAgo()
    this.time_tag = this._getTimeTag()
    this.txt = this._getTxt()
    this.plain_text = this._getPlainText()
  }

  isReply() {
    return this.in_reply_to_status_id !== '' || this.in_reply_to_user_id !== ''
  }

  isRepost() {
    return this.repost_status_id && this.repost_status_id !== ''
  }

  isOrigin() {
    return !(this.isReply() || this.isRepost())
  }

  isOriginRepost() {
    return this.isOrigin() && this.text.match(/转@/g)
  }

  _getType() {
    if (this.isReply()) {
      return 'reply'
    }

    if (this.isRepost()) {
      return 'repost'
    }

    if (this.isOrigin()) {
      return 'origin'
    }

    return 'unknown'
  }

  _getSourceUrl() {
    if (/<a href="(.*)" target="_blank">.+<\/a>/.test(this.source)) {
      return this.source.match(/<a href="(.*)" target="_blank">.+<\/a>/)[1]
    }

    return ''
  }

  _getSourceName() {
    if (/<a href=".*" target="_blank">(.+)<\/a>/.test(this.source)) {
      return this.source.match(/<a href=".*" target="_blank">(.+)<\/a>/)[1]
    }

    return this.source
  }

  _getTimeAgo() {
    return timeago().format(this.created_at, 'fanfou_weapp')
  }

  _getTimeTag() {
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

  _getTxt() {
    const pattern = /[@#]?<a href="(.*?)".*?>([\s\S\n]*?)<\/a>#?/g
    const tagPattern = /#<a href="\/q\/(.*?)".?>([\s\S\n]*)<\/a>#/
    const atPattern =
      /@<a href="(http|https):\/\/[.a-z\d-]*fanfou.com\/(.*?)".*?>(.*?)<\/a>/
    const linkPattern = /<a href="(.*?)".*?>(.*?)<\/a>/
    const match = this.text.match(pattern)
    const txt = []
    let theText = this.text
    if (match) {
      for (const item of match) {
        const index = theText.indexOf(item)

        // Text
        if (index > 0) {
          const text = theText.slice(0, index)
          const originText = he.decode(
            Status.removeBoldTag(theText.slice(0, index)),
          )
          const thisTxt = {
            type: 'text',
            text: originText,
            _text: originText.replace(/\n{3,}/g, '\n\n'),
          }
          if (Status.hasBold(text)) {
            thisTxt.bold_arr = Status.getBoldArr(text)
          }

          txt.push(thisTxt)
        }

        // Tag
        if (item.slice(0, 1) === '#' && tagPattern.test(item)) {
          const matchText = item.match(tagPattern)
          const text = `#${matchText[2]}#`
          const originText = he.decode(Status.removeBoldTag(text))
          const thisTxt = {
            type: 'tag',
            text: originText,
            _text: originText.replace(/\n{2,}/g, '\n'),
            query: decodeURIComponent(he.decode(matchText[1])),
          }
          if (Status.hasBold(text)) {
            thisTxt.bold_arr = Status.getBoldArr(text)
          }

          txt.push(thisTxt)
        }

        // At
        if (item.slice(0, 1) === '@' && atPattern.test(item)) {
          const matchText = item.match(atPattern)
          const text = `@${matchText[3]}`
          const originText = he.decode(Status.removeBoldTag(text))
          const thisTxt = {
            type: 'at',
            text: originText,
            name: he.decode(matchText[3]),
            id: matchText[2],
          }
          if (Status.hasBold(text)) {
            thisTxt.bold_arr = Status.getBoldArr(text)
          }

          txt.push(thisTxt)
        }

        // Link
        if (item.slice(0, 1) === '<' && linkPattern.test(item)) {
          const matchText = item.match(linkPattern)
          const [, link, text] = matchText
          const originText = Status.removeBoldTag(text)
          const thisTxt = {
            type: 'link',
            text: originText,
            link,
          }
          if (Status.hasBold(text)) {
            thisTxt.bold_arr = Status.getBoldArr(text)
          }

          txt.push(thisTxt)
        }

        theText = theText.slice(index + item.length)
      }

      if (theText.length > 0) {
        const text = theText
        const originText = he.decode(Status.removeBoldTag(text))
        const thisTxt = {
          type: 'text',
          text: originText,
          _text: originText.replace(/\n{3,}/g, '\n\n'),
        }
        if (Status.hasBold(text)) {
          thisTxt.bold_arr = Status.getBoldArr(text)
        }

        txt.push(thisTxt)
      }

      return txt
    }

    const text = theText
    const originText = he.decode(Status.removeBoldTag(theText))
    const thisTxt = {
      type: 'text',
      text: originText,
      _text: originText.replace(/\n{3,}/g, '\n\n'),
    }
    if (Status.hasBold(text)) {
      thisTxt.bold_arr = Status.getBoldArr(text)
    }

    return [thisTxt]
  }

  _getPlainText() {
    let text = ''
    for (const t of this.txt) {
      text += t.text
    }

    return he.decode(text)
  }

  static hasBold(text) {
    return text.match(/<b>[\s\S\n]*?<\/b>/g)
  }

  static getBoldArr(text) {
    const pattern = /<b>[\s\S\n]*?<\/b>/g
    let theText = text
    const match = text.match(pattern)
    const textArray = []
    if (match) {
      for (const item of match) {
        const index = theText.indexOf(item)
        if (index > 0) {
          const t = theText.slice(0, index)
          textArray.push({
            text: he.decode(t),
            bold: false,
          })
        }

        const [, t] = item.match(/<b>([\s\S\n]*?)<\/b>/)
        textArray.push({
          text: he.decode(t),
          bold: true,
        })
        theText = theText.slice(index + item.length)
      }

      if (theText.length > 0) {
        textArray.push({
          text: he.decode(theText),
          bold: false,
        })
      }

      return textArray
    }

    return [
      {
        text: he.decode(text),
        bold: false,
      },
    ]
  }

  static removeBoldTag(text) {
    return text.replace(/<b>/g, '').replace(/<\/b>/g, '')
  }
}

module.exports = Status
