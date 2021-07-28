import { tmpdir } from 'os'
import { resolve } from 'path'

import { setupSIGUSR2 } from '@dr-js/core/module/node/module/RuntimeDump.js'
import { getAuthCommonOption, getAuthSkipOption, getAuthFileOption, getAuthFileGroupOption } from '@dr-js/core/module/node/server/Feature/Auth/option.js'
import { getFileOption } from '@dr-js/core/module/node/server/Feature/File/option.js'
import { getExplorerOption } from '@dr-js/core/module/node/server/Feature/Explorer/option.js'
// import { getWebSocketTunnelOption } from '@dr-js/core/module/node/server/Feature/WebSocketTunnelDev/option.js'
import { getServerExotOption, getLogOption, getPidOption } from '@dr-js/core/module/node/server/Feature/@/option.js'
import { runServer } from '@dr-js/core/module/node/server/Feature/@/configure.js'

import { getWeblogOption } from 'source/server/feature/Weblog/option.js'
import { generateWeblogFromPath } from 'source/module/WeblogMarkdown/generate.js'

import { autoPathOption, configureServer } from './configureServer.js'
import { MODE_NAME_LIST, parseOption, formatUsage } from './option.js'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (modeName, optionData) => {
  switch (modeName) {
    case 'host':
      setupSIGUSR2(resolve(tmpdir(), packageName, packageVersion))
      return runServer(configureServer, {
        ...getPidOption(optionData),
        ...getLogOption(optionData),
        ...getServerExotOption(optionData)
      }, autoPathOption({
        packageName, packageVersion,
        rootPath: optionData.tryGetFirst('root-path'),
        ...getAuthCommonOption(optionData), ...getAuthSkipOption(optionData), ...getAuthFileOption(optionData), ...getAuthFileGroupOption(optionData),
        ...getFileOption(optionData),
        ...getExplorerOption(optionData),
        // ...getWebSocketTunnelOption(optionData),
        ...getWeblogOption(optionData)
      }))
    case 'generate-weblog':
      return generateWeblogFromPath(autoPathOption({
        log: console.log,
        rootPath: optionData.tryGetFirst('root-path'),
        ...getWeblogOption(optionData)
      }))
  }
}

const main = async () => {
  const optionData = await parseOption()
  if (optionData.getToggle('version')) return console.log(JSON.stringify({ packageName, packageVersion }, null, 2))
  if (optionData.getToggle('help')) return console.log(formatUsage())
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))
  if (!modeName) throw new Error('no mode specified')
  await runMode(modeName, optionData).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}: ${error.stack || error}`)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
