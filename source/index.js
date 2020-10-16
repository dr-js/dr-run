import { tmpdir } from 'os'
import { resolve } from 'path'

import { setupSIGUSR2 } from '@dr-js/node/module/module/RuntimeDump'
import { getAuthCommonOption, getAuthSkipOption, getAuthFileOption, getAuthFileGroupOption } from '@dr-js/node/module/server/feature/Auth/option'
import { getFileOption } from '@dr-js/node/module/server/feature/File/option'
import { getExplorerOption } from '@dr-js/node/module/server/feature/Explorer/option'
import { getWebSocketTunnelOption } from '@dr-js/node/module/server/feature/WebSocketTunnelDev/option'
import { getServerExotOption, getLogOption, getPidOption } from '@dr-js/node/module/server/share/option'
import { runServer } from '@dr-js/node/module/server/share/configure'

import { getWeblogOption } from 'source/server/feature/Weblog/option'
import { generateWeblogFromPath } from 'source/module/WeblogMarkdown/generate'

import { autoPathOption, configureServer } from './configureServer'
import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
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
        ...getWebSocketTunnelOption(optionData),
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
  if (optionData.tryGet('version')) return console.log(JSON.stringify({ packageName, packageVersion }, null, 2))
  if (optionData.tryGet('help')) return console.log(formatUsage())
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
