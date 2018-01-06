'use strict'

const enUS = require('./languages/en-us')
const zhCN = require('./languages/zh-cn')
const esES = require('./languages/es-es')

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
  case 'es':
    lang = esES
    break
  default:
    break
}

module.exports = lang
