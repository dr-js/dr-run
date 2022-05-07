const { runKit, argvFlag } = require('@dr-js/core/library/node/kit.js')

const { getSourceJsFileListFromPathList } = require('@dr-js/dev/library/node/filePreset.js')
const { initOutput, packOutput, clearOutput, verifyNoGitignore, verifyGitStatusClean, verifyPackageVersionStrict, publishPackage } = require('@dr-js/dev/library/output.js')
const { getTerserOption, minifyFileListWithTerser } = require('@dr-js/dev/library/minify.js')

runKit(async (kit) => {
  const processOutput = async () => {
    const fileList = await getSourceJsFileListFromPathList([ '.' ], kit.fromOutput)
    let sizeReduce = 0
    sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), kit })
    kit.padLog(`size reduce: ${sizeReduce}B`)
  }

  await verifyNoGitignore({ path: kit.fromRoot('source'), kit })
  const packageJSON = await initOutput({
    kit,
    copyMapPathList: [
      [ 'source-bin/index.js', 'bin/index.js' ],
      [ 'node_modules/@dr-js/core/library/Dr.browser.js', 'library/Dr.browser.js' ] // TODO: NOTE: for `DR_BROWSER_FILE_PATH()` from `@dr-js/core`
    ]
  })
  if (!argvFlag('pack')) return

  const isPublish = argvFlag('publish')
  const isTest = isPublish || argvFlag('test')
  isPublish && verifyPackageVersionStrict(packageJSON.version)

  kit.RUN('npm run script-generate-spec')
  kit.RUN('npm run build-library')

  await processOutput({ kit })
  isTest && kit.RUN('npm run lint')
  isTest && await processOutput({ kit }) // once more
  isTest && kit.RUN('npm run test-source')
  await clearOutput({ kit })
  isTest && await verifyGitStatusClean({ kit })
  const pathPackagePack = await packOutput({ kit })
  isPublish && await publishPackage({ packageJSON, pathPackagePack, kit })
})
