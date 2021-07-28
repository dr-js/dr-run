import { getSourceJsFileListFromPathList } from '@dr-js/dev/module/node/filePreset.js'
import { initOutput, packOutput, clearOutput, verifyNoGitignore, verifyGitStatusClean, verifyOutputBin, publishOutput } from '@dr-js/dev/module/output.js'
import { getTerserOption, minifyFileListWithTerser } from '@dr-js/dev/module/minify.js'
import { processFileList, fileProcessorWebpack } from '@dr-js/dev/module/fileProcessor.js'
import { runMain, argvFlag, commonCombo } from '@dr-js/dev/module/main.js'

runMain(async (logger) => {
  const { RUN, fromRoot, fromOutput } = commonCombo(logger)

  const processOutput = async ({ logger }) => {
    const fileList = await getSourceJsFileListFromPathList([ '.' ], fromOutput)
    let sizeReduce = 0
    sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), rootPath: fromOutput(), logger })
    sizeReduce += await processFileList({ fileList, processor: fileProcessorWebpack, rootPath: fromOutput(), logger })
    logger.padLog(`size reduce: ${sizeReduce}B`)
  }

  await verifyNoGitignore({ path: fromRoot('source'), logger })
  const packageJSON = await initOutput({
    copyMapPathList: [
      [ 'source-bin/index.js', 'bin/index.js' ],
      [ 'node_modules/@dr-js/core/library/Dr.browser.js', 'library/Dr.browser.js' ] // TODO: NOTE: for `DR_BROWSER_FILE_PATH()` from `@dr-js/core`
    ],
    fromRoot, fromOutput, logger
  })
  if (!argvFlag('pack')) return

  logger.padLog('generate spec')
  RUN('npm run script-generate-spec')
  logger.padLog('build library')
  RUN('npm run build-library')

  await processOutput({ logger })
  const isTest = argvFlag('test', 'publish', 'publish-dev')
  isTest && logger.padLog('lint source')
  isTest && RUN('npm run lint')
  isTest && await processOutput({ logger }) // once more
  isTest && logger.padLog('test source')
  isTest && RUN('npm run test-source')
  await clearOutput({ fromOutput, logger })
  await verifyOutputBin({ fromOutput, packageJSON, logger })
  isTest && await verifyGitStatusClean({ fromRoot, logger })
  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ packageJSON, pathPackagePack, logger })
})
