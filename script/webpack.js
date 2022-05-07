const { runKit } = require('@dr-js/core/library/node/kit.js')
const { compileWithWebpack, commonFlag } = require('@dr-js/dev/library/webpack.js')

runKit(async (kit) => {
  const { mode, isWatch, profileOutput, getCommonWebpackConfig } = await commonFlag({ kit })

  const config = getCommonWebpackConfig({
    isNodeEnv: true,
    output: { path: kit.fromOutput('library'), filename: '[name].js' },
    entry: { 'index': 'source/index' }
  })

  kit.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, kit })
}, 'webpack')
