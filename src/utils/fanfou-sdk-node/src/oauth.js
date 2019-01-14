'use strict'

const {OAuth} = require('../modules/oauth/oauth')
const qs = require('../modules/querystring/index')

Object.assign(OAuth.prototype, {
  getXAuthAccessToken (username, password, callback) {
    const xauthParams = {
      x_auth_mode: 'client_auth',
      x_auth_password: password,
      x_auth_username: username
    }

    this._performSecureRequest(null, null, this._clientOptions.accessTokenHttpMethod, this._accessUrl, xauthParams, null, null, (error, data, response) => {
      if (error) {
        callback(error)
      } else {
        const contentType = response.header['Content-Type']
        if (contentType.match(/application\/xml/)) {
          const error = data.match(/<error>(.*)<\/error>/)
          callback(new Error(error))
          return
        }

        const results = qs.parse(data)
        const oauthAccessToken = results.oauth_token
        delete results.oauth_token
        const oauthAccessTokenSecret = results.oauth_token_secret
        delete results.oauth_token_secret
        callback(null, oauthAccessToken, oauthAccessTokenSecret, results)
      }
    })
  }
})

Object.assign(OAuth.prototype, {
  _getSignature (method, url, parameters, tokenSecret) {
    url = url.replace(/https/, 'http').replace(/fanfou\.pro/, 'fanfou.com')
    const signatureBase = this._createSignatureBase(method, url, parameters)
    return this._createSignature(signatureBase, tokenSecret)
  }
})

module.exports = OAuth
