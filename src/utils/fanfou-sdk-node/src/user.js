'use strict'

const mzsi = require('../modules/mzsi/index')

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
    this.sign_name = this._getSignName()
    this.fanfou_age = this._getFanfouAge()
  }

  _getSignName () {
    if (this.birthday.length) {
      const matchYMD = this.birthday.match(/\d{4}-(\d{2})-(\d{2})/)
      const month = parseInt(matchYMD[1])
      const day = parseInt(matchYMD[2])
      if (month > 0 && day > 0) return mzsi(month, day).name
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
      years = years - 1
      months = months + 12
    }

    if (days < 0) {
      const daySum = getDays(nowYear, nowMonth)
      months = months - 1
      days = days + daySum
    }

    return `${years ? years + ' 年 ' : ''}${months ? months + ' 个月 ' : ''}${days ? days + ' 天' : ''}`
  }
}

module.exports = User
