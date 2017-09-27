'use strict'

const {
  OAUTH_DOMAIN,
  API_DOMAIN
} = require('../../../config/fanfou')

const qs = require('../modules/querystring/index')
const oauthSignature = require('../modules/oauth-signature/index')
const OAuth = require('./oauth')
const Status = require('./status')
const User = require('./user')

class Fanfou {
  constructor (options) {
    options = options || {}

    // Required
    this.consumer_key = options.consumer_key
    this.consumer_secret = options.consumer_secret
    this.auth_type = options.auth_type

    // Optional
    this.protocol = options.protocol || 'https:'
    this.api_domain = options.api_domain || API_DOMAIN
    this.request_url = options.request_url || `https://${OAUTH_DOMAIN}/oauth/request_token`
    this.access_url = options.access_url || `https://${OAUTH_DOMAIN}/oauth/access_token`

    // Oauth required
    if (this.auth_type === 'oauth') {
      this.oauth_token = options.oauth_token || ''
      this.oauth_token_secret = options.oauth_token_secret || ''
    }

    // Xauth required
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
    this.oauth.getXAuthAccessToken(this.username, this.password, (e, oauthToken, oauthTokenSecret) => {
      if (e) {
        callback(e)
      } else {
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
      (e, data) => {
        if (e) {
          callback(e, null, null)
        } else if (Fanfou._uriType(uri) === 'timeline') {
          const arr = []
          for (const i in data) {
            if (data[i]) {
              arr.push(new Status(data[i]))
            }
          }
          callback(null, data, arr)
        } else if (Fanfou._uriType(uri) === 'status') {
          callback(null, data, new Status(data))
        } else if (Fanfou._uriType(uri) === 'users') {
          const arr = []
          for (const i in data) {
            if (data[i]) {
              arr.push(new User(data[i]))
            }
          }
          callback(null, data, arr)
        } else if (Fanfou._uriType(uri) === 'user') {
          callback(null, data, new User(data))
        } else {
          callback(null, data, null)
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
      (e, data) => {
        if (e) {
          callback(e, null)
        } else if (Fanfou._uriType(uri) === 'timeline') {
          const arr = []
          for (const i in data) {
            if (data[i]) {
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
    )
  }

  upload (filePaths, text, tokens, callback) {
    this.oauth.oauth_token = tokens.oauth_token
    this.oauth.oauth_token_secret = tokens.oauth_token_secret
    const method = 'POST'
    const url = this.protocol + '//' + this.api_domain + '/photos/upload.json'
    const params = {
      oauth_consumer_key: this.consumer_key,
      oauth_token: tokens.oauth_token,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_nonce: this.oauth._getNonce(6),
      oauth_version: '1.0'
    }
    const signature = oauthSignature.generate(
      method,
      url.replace('https', 'http'),
      params,
      this.consumer_secret,
      tokens.oauth_token_secret,
      {encodeSignature: false}
    )
    const authorizationHeader = this.oauth._buildAuthorizationHeaders(
      this.oauth._sortRequestParams(
        this.oauth._makeArrayOfArgumentsHash(params)
      ).concat([['oauth_signature', signature]])
    )
    wx.uploadFile({
      url: 'https://api.fanfou.com/photos/upload.json',
      filePath: filePaths[0],
      header: {Authorization: authorizationHeader},
      name: 'photo',
      formData: {
        status: text
      },
      success (res) {
        const data = res.data
        callback(null, data, data)
      },
      fail () {
        callback(new Error('upload failed'))
      }
    })
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
      '/favorites/create': 'status',
      '/users/tagged': 'users',
      '/users/followers': 'users',
      '/users/friends': 'users',
      '/friendships/requests': 'users',
      '/users/show': 'user',
      '/friendships/create': 'user',
      '/friendships/destroy': 'user'
    }
    return uriList[uri] || null
  }
}

module.exports = Fanfou
