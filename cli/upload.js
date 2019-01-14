#!/usr/bin/env node
'use strict'

const path = require('path')
const ora = require('ora')
const execa = require('execa')
const chalk = require('chalk')

const pkg = require('../package')

const macCLI = '/Applications/wechatwebdevtools.app/Contents/Resources/app.nw/bin/cli'
const {version} = pkg
const xiaofanPath = path.join(__dirname, '../src')

process.spinner = ora('Uploading...').start()

const run = async () => {
  try {
    const {stdout} = await execa(macCLI, ['-u', `${version}@${xiaofanPath}`], {timeout: 10000})
    if (stdout.match('upload success')) {
      process.spinner.succeed(chalk.green(` Xiaofan v${pkg.version} published!`))
      process.exit()
    }

    process.spinner.fail('Upload timeout!')
    process.exit(1)
  } catch (err) {
    const match = err.message.match(/error: '{"code":\d+,"error":"(.+)"}',/)
    if (match) {
      const [, message] = match
      process.spinner.fail(message + '！')
      process.exit(1)
    } else {
      process.spinner.fail(err.message)
      process.exit(1)
    }
  }
}

run()
