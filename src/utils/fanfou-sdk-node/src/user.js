'use strict'

const mzsi = require('../modules/mzsi/index')
const i18n = require('../../../i18n/index')

class User {
  constructor (user) {
    this.id = user.id
    this.name = user.name
    this.screen_name = user.screen_name
    this.unique_id = user.unique_id
    this.location = user.location
    this.gender = user.gender
    this.birthday = user.birthday
    this.description = user.description
    this.profile_image_url = user.profile_image_url
    this.profile_image_url_large = user.profile_image_url_large
    this.url = user.url
    this.protected = user.protected
    this.followers_count = user.followers_count
    this.friends_count = user.friends_count
    this.favourites_count = user.favourites_count
    this.statuses_count = user.statuses_count
    this.photo_count = user.photo_count
    this.following = user.following
    this.notifications = user.notifications
    this.created_at = user.created_at
    this.utc_offset = user.utc_offset
    this.profile_background_color = user.profile_background_color
    this.profile_text_color = user.profile_text_color
    this.profile_link_color = user.profile_link_color
    this.profile_sidebar_fill_color = user.profile_sidebar_fill_color
    this.profile_sidebar_border_color = user.profile_sidebar_border_color
    this.profile_background_image_url = user.profile_background_image_url
    this.profile_background_tile = user.profile_background_tile
    if (user.status) {
      this.status = user.status
    }

    this.sign_name = this._getSignName()
    this.fanfou_age = this._getFanfouAge()
    this.birth_date = this._getBirthDate()
    this.is_me = this._isMe(user)
    this.is_secret = user.protected && !user.following
    this.taEnd = user.gender === '男' ? '他' : user.gender === '女' ? '她' : ' TA'
    this.taBegin = user.gender === '男' ? '他' : user.gender === '女' ? '她' : 'TA '
    this.taMiddle = user.gender === '男' ? '他' : user.gender === '女' ? '她' : ' TA '
  }

  _isMe (user) {
    if (
      getApp() &&
      getApp().globalData &&
      getApp().globalData.account &&
      getApp().globalData.account.user &&
      getApp().globalData.account.user.unique_id
    ) {
      return user.unique_id === getApp().globalData.account.user.unique_id
    }
  }

  _getSignName () {
    if (this.birthday.length > 0) {
      const matchYMD = this.birthday.match(/\d{4}-(\d{2})-(\d{2})/)
      const month = parseInt(matchYMD[1], 10)
      const day = parseInt(matchYMD[2], 10)
      if (month > 0 && day > 0) {
        return mzsi(month, day).name
      }
    }

    return ''
  }

  _getFanfouAge () {
    const getDays = (year, month) => {
      return new Date(year, month, 0).getDate()
    }

    const reg = new Date(this.created_at)
    const now = new Date()

    const regYear = reg.getFullYear()
    const regMonth = reg.getMonth() + 1
    const regDate = reg.getDate()
    const nowYear = now.getFullYear()
    const nowMonth = now.getMonth() + 1
    const nowDate = now.getDate()

    let years = nowYear - regYear
    let months = nowMonth - regMonth
    let days = nowDate - regDate

    if (months < 0) {
      years -= 1
      months += 12
    }

    if (days < 0) {
      const daySum = getDays(nowYear, nowMonth)
      if (months === 0) {
        months += 11
        years -= 1
      } else {
        months -= 1
      }

      days += daySum
    }

    if (years + months + days === 0) {
      return i18n.me.register_today
    }

    return `${days === 0 ? i18n.common.just : ''}${years ? years + i18n.common.years : ''}${months ? months + i18n.common.months : ''}${days ? days + i18n.common.days : ''}`
  }

  _getBirthDate () {
    const match = this.birthday.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10)
      const day = parseInt(match[3], 10)
      const yearStr = year ? year.toString() + i18n.me.year : ''
      const dateStr = month && day ? month.toString() + i18n.me.month + day.toString() + i18n.me.day : ''
      return yearStr + dateStr
    }

    return ''
  }
}

module.exports = User
