import { resolve } from 'path'
import { execSync } from 'child_process'

import { binary } from '@dr-js/core/module/common/format'

import { getScriptFileListFromPathList } from '@dr-js/dev/module/node/file'
import { runMain, argvFlag } from '@dr-js/dev/module/main'
import { initOutput, packOutput, verifyOutputBinVersion, publishOutput } from '@dr-js/dev/module/output'
import { processFileList, fileProcessorWebpack } from '@dr-js/dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from '@dr-js/dev/module/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execShell = (command) => execSync(command, { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit' })

runMain(async (logger) => {
  const { padLog } = logger

  padLog('generate spec')
  execShell('npm run script-generate-spec')

  const packageJSON = await initOutput({
    copyMapPathList: [
      [ 'source-bin/index.js', 'bin/index.js' ],
      [ 'node_modules/@dr-js/core/library/Dr.browser.js', 'library/Dr.browser.js' ] // TODO: NOTE: for `getDrBrowserScriptHTML()` from `dr-server`
    ],
    fromRoot,
    fromOutput,
    logger
  })

  if (!argvFlag('pack')) return
  padLog('lint source')
  execShell('npm run lint')

  padLog('build library')
  execShell('npm run build-library')

  padLog('process output')
  const fileList = await getScriptFileListFromPathList([ '.' ], fromOutput)
  let sizeReduce = 0
  sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList, processor: fileProcessorWebpack, rootPath: PATH_OUTPUT, logger })
  padLog(`total size reduce: ${binary(sizeReduce)}B`)

  await verifyOutputBinVersion({ fromOutput, packageJSON, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, isPublicScoped: true, packageJSON, pathPackagePack, logger })
})
