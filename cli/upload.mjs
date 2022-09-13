#!/usr/bin/env node
import path from 'node:path'
import fs from 'node:fs/promises'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import ora from 'ora'
import {execa} from 'execa'
import chalk from 'chalk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  await fs.readFile(path.join(__dirname, '..', 'package.json')),
)

const macCLI =
  '/Applications/wechatwebdevtools.app/Contents/Resources/app.nw/bin/cli'
const {version} = pkg
const xiaofanPath = path.join(__dirname, '..')

process.spinner = ora('Uploading...').start()

const run = async () => {
  try {
    const {stdout} = await execa(macCLI, ['-u', `${version}@${xiaofanPath}`], {
      timeout: 10_000,
    })
    if (stdout.match('upload success')) {
      process.spinner.succeed(
        chalk.green(` Xiaofan v${pkg.version} published!`),
      )
      process.exit()
    }

    process.spinner.fail('Upload timeout!')
    process.exit(1)
  } catch (error) {
    const match = error.message.match(/error: '{"code":\d+,"error":"(.+)"}',/)
    if (match) {
      const [, message] = match
      process.spinner.fail(message + '！')
      process.exit(1)
    } else {
      process.spinner.fail(error.message)
      process.exit(1)
    }
  }
}

run()
