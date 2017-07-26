'use strict'

const {OAuth} = require('../modules/oauth/oauth')
const qs = require('../modules/querystring/index')

Object.assign(OAuth.prototype, {
  getXAuthAccessToken (username, password, callback) {
    const xauthParams = {
      'x_auth_mode': 'client_auth',
      'x_auth_password': password,
      'x_auth_username': username
    }

    this._performSecureRequest(null, null, this._clientOptions.accessTokenHttpMethod, this._accessUrl, xauthParams, null, null, function (error, data, response) {
      if (error) callback(error)
      else {
        const results = qs.parse(data)
        const oauthAccessToken = results['oauth_token']
        delete results['oauth_token']
        const oauthAccessTokenSecret = results['oauth_token_secret']
        delete results['oauth_token_secret']
        callback(null, oauthAccessToken, oauthAccessTokenSecret, results)
      }
    })
  }
})

Object.assign(OAuth.prototype, {
  _getSignature (method, url, parameters, tokenSecret) {
    url = url.replace('https', 'http')
    const signatureBase = this._createSignatureBase(method, url, parameters)
    return this._createSignature(signatureBase, tokenSecret)
  }
})

module.exports = OAuth
