const FanfouSDK = require('./fanfou-sdk-node/index')
const Promise = require('./es6-promise')
const User = require('./fanfou-sdk-node/src/user')

const {
  CONSUMER_KEY,
  CONSUMER_SECRET
} = require('../config/fanfou')

class Error {
  constructor (message) {
    this.message = message || 'error'
  }
}

class Fanfou {
  static auth (username, password, callback) {
    const ff = new FanfouSDK({
      auth_type: 'xauth',
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET,
      username: username,
      password: password
    })

    ff.xauth((e, tokens) => {
      if (e) callback(e)
      else callback(null, tokens)
    })
  }

  // promisified auth method
  static authPromise (username, password) {
    return new Promise((resolve, reject) => {
      if (typeof username !== 'string' || username.length === 0) return reject(new Error('Need username'))
      if (typeof password !== 'string' || password.length === 0) return reject(new Error('Need password'))

      const ff = new FanfouSDK({
        auth_type: 'xauth',
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        username: username,
        password: password
      })

      ff.xauth((e, tokens) => {
        if (e) {
          return reject(e)
        } else {
          this.get('/account/verify_credentials', {}, tokens, (e, res, obj) => {
            // save tokens in local storage
            try {
              const account = { tokens: tokens, user: new User(res) }
              // set global token data
              getApp().globalData.account = account
              var accounts = wx.getStorageSync('accounts') || []
              accounts.unshift(account)
              wx.setStorageSync('accounts', accounts)
            } catch (e) {
              console.error(e)
            }
            return resolve(tokens)
          })
        }
      })
    })
  }

  static get (uri, params, tokens, callback) {
    const ff = new FanfouSDK({
      auth_type: 'oauth',
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET
    })

    ff.get(uri, params, tokens, (e, res, obj) => {
      callback(e, res, obj)
    })
  }

  // promisified get method
  static getPromise (uri, params) {
    return new Promise((resolve, reject) => {
      let tokens = getApp().globalData.account.tokens
      if (!tokens || !tokens.oauth_token || !tokens.oauth_token_secret) return reject(new Error(`Not authed, will not make get request to <${uri}>`))

      const ff = new FanfouSDK({
        auth_type: 'oauth',
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET
      })

      ff.get(uri, params, tokens, (e, res, obj) => {
        if (e) {
          return reject(e)
        } else {
          return resolve({ res: res, obj: obj })
        }
      })
    })
  }

  static post (uri, params, tokens, callback) {
    const ff = new FanfouSDK({
      auth_type: 'oauth',
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET
    })

    ff.get(uri, params, tokens, (e, res, obj) => {
      callback(e, res, obj)
    })
  }

  // promisified post method
  static postPromise (uri, params) {
    return new Promise((resolve, reject) => {
      let tokens = getApp().globalData.account.tokens
      if (!tokens || !tokens.oauth_token || !tokens.oauth_token_secret) return reject(new Error(`Not authed, will not make post request to <${uri}>`))

      const ff = new FanfouSDK({
        auth_type: 'oauth',
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET
      })

      ff.post(uri, params, tokens, (e, res, obj) => {
        if (e) {
          return reject(e)
        } else {
          return resolve({ res: res, obj: obj })
        }
      })
    })
  }

  static upload (filePaths, text, tokens, callback) {
    const ff = new FanfouSDK({
      auth_type: 'oauth',
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET
    })

    ff.upload(filePaths, text, tokens, (e, res, obj) => {
      callback(e, res, obj)
    })
  }

  // promisified upload method
  static uploadPromise (filePaths, param) {
    return new Promise((resolve, reject) => {
      let tokens = getApp().globalData.account.tokens
      if (!tokens || !tokens.oauth_token || !tokens.oauth_token_secret) return reject(new Error(`Not authed, will not make upload image <${filePaths}>`))
      const ff = new FanfouSDK({
        auth_type: 'oauth',
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET
      })

      ff.upload(filePaths, param.status, tokens, (e, res, obj) => {
        if (e) {
          return reject(e)
        } else {
          return resolve({ res: res, obj: obj })
        }
      })
    })
  }
}

module.exports = Fanfou
