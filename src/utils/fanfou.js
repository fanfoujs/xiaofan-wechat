const {
  CONSUMER_KEY,
  CONSUMER_SECRET
} = require('../config/fanfou')

const FanfouSDK = require('./fanfou-sdk-node/index')

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
        reject(new Error('Need username'))
      }

      if (typeof password !== 'string' || password.length === 0) {
        reject(new Error('Need password'))
      }

      const ff = new FanfouSDK({
        auth_type: 'xauth',
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        username,
        password
      })
      ff.xauth((err, tokens) => {
        if (err) {
          reject(err)
        } else {
          this.loadMePromise(tokens).then(resolve).catch(reject)
        }
      })
    })
  }

  static loadMePromise (tokens) {
    tokens = tokens || getApp().globalData.account.tokens
    return new Promise((resolve, reject) => {
      this.get('/account/verify_credentials', {}, tokens, (err, user) => {
        if (err) {
          reject(err)
        } else {
          // Save tokens to local storage
          user.is_me = true
          const account = {
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            tokens,
            id: user.id,
            name: user.name,
            user
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
          resolve({user: account.user, tokens})
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

    ff.get(uri, params, tokens, (e, res) => {
      callback(e, res)
    })
  }

  // Promisified get method
  static getPromise (uri, params) {
    return new Promise((resolve, reject) => {
      const {
        consumer_key,
        consumer_secret,
        tokens
      } = getApp().globalData.account || {}
      if (!tokens || !tokens.oauth_token || !tokens.oauth_token_secret) {
        reject(new Error('not authed'))
        wx.redirectTo({url: '/pages/login/login'})
      }

      const ff = new FanfouSDK({
        auth_type: 'oauth',
        consumer_key,
        consumer_secret
      })

      ff.get(uri, params, tokens, (e, res) => {
        if (e) {
          reject(e)
        } else {
          resolve(res)
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

    ff.post(uri, params, tokens, (e, res) => {
      callback(e, res)
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

      ff.post(uri, params, tokens, (e, res) => {
        if (e) {
          reject(e)
        } else {
          resolve(res)
        }
      })
    })
  }

  static upload (uri, filePaths, parameters, tokens, callback) {
    const ff = new FanfouSDK({
      auth_type: 'oauth',
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET
    })

    ff.upload(uri, filePaths, parameters, tokens, (e, res) => {
      callback(e, res)
    })
  }

  // Promisified upload method
  static uploadPromise (uri, filePaths, parameters) {
    return new Promise((resolve, reject) => {
      const {
        consumer_key,
        consumer_secret,
        tokens
      } = getApp().globalData.account
      if (!tokens || !tokens.oauth_token || !tokens.oauth_token_secret) {
        reject(new Error(`Not authed, will not make upload image <${filePaths}>`))
      }

      const ff = new FanfouSDK({
        auth_type: 'oauth',
        consumer_key,
        consumer_secret
      })

      ff.upload(uri, filePaths, parameters, tokens, (err, res) => {
        if (err) {
          reject(err)
        } else {
          try {
            const result = JSON.parse(res)
            resolve(result)
          } catch (err2) {
            reject(err2)
          }
        }
      })
    })
  }
}

module.exports = Fanfou
