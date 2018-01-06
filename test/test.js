'use strict'

const fs = require('fs')
const path = require('path')
const test = require('ava')

test('Check language files', t => {
  const languageFilesPath = path.join(__dirname, '../src/i18n/languages')
  const files = fs.readdirSync(languageFilesPath).filter(name => name.match(/[a-z]{2}-[a-z]{2}\.js/))

  files.forEach(filename => {
    const lang = require(path.join(languageFilesPath, filename))

    t.true(lang.common.ok.length <= 4)
    t.true(lang.common.confirm.length <= 4)
  })
})
