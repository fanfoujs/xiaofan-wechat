'use strict'

const OAuth = require('./oauth')
const qs = require('../modules/querystring/index')
const Status = require('./status')

const {
  OAUTH_DOMAIN,
  API_DOMAIN
} = require('../../../config/fanfou')

class Fanfou {
  constructor (options) {
    options = options || {}

    // required
    this.consumer_key = options.consumer_key
    this.consumer_secret = options.consumer_secret
    this.auth_type = options.auth_type

    // optional
    this.protocol = options.protocol || 'https:'
    this.api_domain = options.api_domain || API_DOMAIN
    this.request_url = options.request_url || `https://${OAUTH_DOMAIN}/oauth/request_token`
    this.access_url = options.access_url || `https://${OAUTH_DOMAIN}/oauth/access_token`

    // oauth required
    if (this.auth_type === 'oauth') {
      this.oauth_token = options.oauth_token || ''
      this.oauth_token_secret = options.oauth_token_secret || ''
    }

    // xauth required
    if (this.auth_type === 'xauth') {
      this.username = options.username || ''
      this.password = options.password || ''
    }

    this.is_streaming = false
    this.oauth = new OAuth(
      this.request_url,
      this.access_url,
      this.consumer_key,
      this.consumer_secret,
      '1.0',
      null,
      'HMAC-SHA1'
    )
  }

  xauth (callback) {
    this.oauth.getXAuthAccessToken(this.username, this.password, (e, oauthToken, oauthTokenSecret, result) => {
      if (e) callback(e)
      else {
        this.oauth.oauth_token = oauthToken
        this.oauth.oauth_token_secret = oauthTokenSecret
        callback(null, {
          oauth_token: oauthToken,
          oauth_token_secret: oauthTokenSecret
        })
      }
    })
  }

  get (uri, parameters, tokens, callback) {
    const url = this.protocol + '//' + this.api_domain + uri + '.json'
    this.oauth.get(
      url + '?' + qs.stringify(parameters),
      tokens.oauth_token,
      tokens.oauth_token_secret,
      (e, data, res) => {
        // TODO http status code
        if (e) callback(e, null, null)
        else {
          if (Fanfou._uriType(uri) === 'timeline') {
            let arr = []
            for (let i in data) {
              if (data.hasOwnProperty(i)) {
                arr.push(new Status(data[i]))
              }
            }
            callback(null, data, arr)
          } else if (Fanfou._uriType(uri) === 'status') {
            callback(null, data, new Status(data))
          } else {
            callback(null, data, null)
          }
        }
      }
    )
  }

  post (uri, parameters, tokens, callback) {
    const url = this.protocol + '//' + this.api_domain + uri + '.json'
    this.oauth.post(
      url,
      tokens.oauth_token,
      tokens.oauth_token_secret,
      parameters,
      (e, data, res) => {
        if (e) callback(e, null)
        else {
          if (Fanfou._uriType(uri) === 'timeline') {
            let arr = []
            for (let i in data) {
              if (data.hasOwnProperty(i)) {
                arr.push(new Status(data[i]))
              }
            }
            callback(null, data, arr)
          } else if (Fanfou._uriType(uri) === 'status') {
            callback(null, data, new Status(data))
          } else {
            callback(null, data, null)
          }
        }
      }
    )
  }

  /**
   * @param uri
   * @returns {string}
   * @private
   */
  static _uriType (uri) {
    const uriList = {
      '/search/public_timeline': 'timeline',
      '/search/user_timeline': 'timeline',
      '/photos/user_timeline': 'timeline',
      '/statuses/friends_timeine': 'timeline',
      '/statuses/home_timeline': 'timeline',
      '/statuses/public_timeline': 'timeline',
      '/statuses/replies': 'timeline',
      '/statuses/user_timeline': 'timeline',
      '/statuses/context_timeline': 'timeline',
      '/statuses/mentions': 'timeline',
      '/favorites': 'timeline',
      '/statuses/update': 'status',
      '/statuses/show': 'status',
      '/favorites/destroy': 'status',
      '/favorites/create': 'status'
    }
    return uriList[uri] || null
  }
}

module.exports = Fanfou
