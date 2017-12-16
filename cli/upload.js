#!/usr/bin/env node
'use strict'

const path = require('path')
const ora = require('ora')
const execa = require('execa')

const pkg = require('../package')

const macCLI = '/Applications/wechatwebdevtools.app/Contents/Resources/app.nw/bin/cli'
const {version} = pkg
const xiaofanPath = path.join(__dirname, '../src')

process.spinner = ora('Uploading...').start()

const run = async () => {
  try {
    const {stdout} = await execa(macCLI, ['-u', `${version}@${xiaofanPath}`], {timeout: 10000})
    if (stdout.match('upload success')) {
      process.spinner.succeed('上传成功！')
      process.exit()
    }
    process.spinner.fail('上传超时！')
    process.exit()
  } catch (err) {
    const match = err.message.match(/error: '{"code":\d+,"error":"(.+)"}',/)
    const message = match[1]
    process.spinner.fail(message + '！')
    process.exit()
  }
}

run()
