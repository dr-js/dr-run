import { resolve } from 'path'

import { runMain } from '@dr-js/dev/module/main'
import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

runMain(async (logger) => {
  const { mode, isWatch, profileOutput, getCommonWebpackConfig } = await commonFlag({ fromRoot, logger })

  const config = getCommonWebpackConfig(({
    isNodeEnv: true,
    output: { path: fromOutput('library'), filename: '[name].js' },
    entry: { index: 'source/index' }
  }))

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, logger })
}, 'webpack')
