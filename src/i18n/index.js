'use strict'

const enUS = require('./languages/en-us')
const zhCN = require('./languages/zh-cn')
const esES = require('./languages/es-es')
const zhHK = require('./languages/zh-hk')
const zhTW = require('./languages/zh-tw')

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
  case 'zh_HK':
    lang = zhHK
    break
  case 'zh_TW':
    lang = zhTW
    break
  case 'es':
    lang = esES
    break
  default:
    break
}

module.exports = lang
