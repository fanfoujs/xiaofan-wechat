'use strict'

const enUS = require('./languages/en-us')
const zhCN = require('./languages/zh-cn')

const {language: langCode} = wx.getSystemInfoSync()
const DEFAULT_LANG = enUS
let lang = DEFAULT_LANG

switch (langCode) {
  case 'en':
    lang = enUS
    break
  case 'zh_CN':
    lang = zhCN
    break
  default:
    break
}

module.exports = lang
