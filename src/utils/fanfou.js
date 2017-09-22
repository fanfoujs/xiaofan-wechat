const {
  CONSUMER_KEY,
  CONSUMER_SECRET
} = require('../config/fanfou')

const FanfouSDK = require('./fanfou-sdk-node/index')
const Promise = require('./es6-promise')
const User = require('./fanfou-sdk-node/src/user')

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
      username,
      password
    })

    ff.xauth((e, tokens) => {
      if (e) {
        callback(e)
      } else {
        callback(null, tokens)
      }
    })
  }

  // Promisified auth method
  static authPromise (username, password) {
    return new Promise((resolve, reject) => {
      if (typeof username !== 'string' || username.length === 0) {
        return reject(new Error('Need username'))
      }
      if (typeof password !== 'string' || password.length === 0) {
        return reject(new Error('Need password'))
      }
      const ff = new FanfouSDK({
        auth_type: 'xauth',
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        username,
        password
      })

      ff.xauth((e, tokens) => {
        if (e) {
          return reject(e)
        }
        this.get('/account/verify_credentials', {}, tokens, (e, res) => {
          // Save tokens to local storage
          try {
            const account = {
              consumer_key: CONSUMER_KEY,
              consumer_secret: CONSUMER_SECRET,
              tokens,
              id: res.id,
              name: res.name,
              user: new User(res)
            }
            // Set global token data
            getApp().globalData.account = account
            const accounts = wx.getStorageSync('accounts') || []
            let index = -1
            for (let i = 0; i < accounts.length; i++) {
              if (account.id === accounts[i].id) {
                index = i
              }
            }
            if (index >= 0) {
              accounts.splice(index, 1)
            }
            accounts.unshift(account)
            wx.setStorageSync('accounts', accounts)
          } catch (err) {
            console.error(err)
          }
          return resolve(tokens)
        })
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

  // Promisified get method
  static getPromise (uri, params) {
    return new Promise((resolve, reject) => {
      const {
        consumer_key,
        consumer_secret,
        tokens
      } = getApp().globalData.account
      if (!tokens || !tokens.oauth_token || !tokens.oauth_token_secret) {
        return reject(new Error(`Not authed, will not make get request to <${uri}>`))
      }
      const ff = new FanfouSDK({
        auth_type: 'oauth',
        consumer_key,
        consumer_secret
      })

      ff.get(uri, params, tokens, (e, res, obj) => {
        if (e) {
          return reject(e)
        }
        return resolve({res, obj})
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

  // Promisified post method
  static postPromise (uri, params) {
    return new Promise((resolve, reject) => {
      const {
        consumer_key,
        consumer_secret,
        tokens
      } = getApp().globalData.account
      if (!tokens || !tokens.oauth_token || !tokens.oauth_token_secret) {
        return reject(new Error(`Not authed, will not make post request to <${uri}>`))
      }

      const ff = new FanfouSDK({
        auth_type: 'oauth',
        consumer_key,
        consumer_secret
      })

      ff.post(uri, params, tokens, (e, res, obj) => {
        if (e) {
          return reject(e)
        }
        return resolve({res, obj})
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

  // Promisified upload method
  static uploadPromise (filePaths, param) {
    return new Promise((resolve, reject) => {
      const {
        consumer_key,
        consumer_secret,
        tokens
      } = getApp().globalData.account
      if (!tokens || !tokens.oauth_token || !tokens.oauth_token_secret) {
        return reject(new Error(`Not authed, will not make upload image <${filePaths}>`))
      }
      const ff = new FanfouSDK({
        auth_type: 'oauth',
        consumer_key,
        consumer_secret
      })

      ff.upload(filePaths, param.status, tokens, (e, res, obj) => {
        if (e) {
          return reject(e)
        }
        return resolve({res, obj})
      })
    })
  }
}

module.exports = Fanfou
