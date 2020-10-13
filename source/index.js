import { tmpdir } from 'os'
import { resolve } from 'path'

import { once } from '@dr-js/core/module/common/function'
import { createExotGroup } from '@dr-js/core/module/common/module/Exot'
import { describeServerOption } from '@dr-js/core/module/node/server/Server'

import { addExitListenerAsync, addExitListenerSync } from '@dr-js/core/module/node/system/ExitListener'

import { setupSIGUSR2 } from '@dr-js/node/module/module/RuntimeDump'
import { configureLog } from '@dr-js/node/module/module/Log'
import { configurePid } from '@dr-js/node/module/module/Pid'
import { configureServerExot } from '@dr-js/node/module/module/ServerExot'
import { getServerExotOption, getLogOption, getPidOption } from '@dr-js/node/module/server/share/option'
import { getAuthCommonOption, getAuthSkipOption, getAuthFileOption, getAuthFileGroupOption } from '@dr-js/node/module/server/feature/Auth/option'
import { getFileOption } from '@dr-js/node/module/server/feature/File/option'
import { getExplorerOption } from '@dr-js/node/module/server/feature/Explorer/option'
import { getWebSocketTunnelOption } from '@dr-js/node/module/server/feature/WebSocketTunnelDev/option'

import { getWeblogOption } from 'source/server/feature/Weblog/option'
import { generateWeblogFromPath } from 'source/module/WeblogMarkdown/generate'

import { autoPathOption, configureServer } from './configureServer'
import { MODE_NAME_LIST, parseOption, formatUsage } from './option'

import PACKAGE_JSON from '../package.json' // TODO: wait for: https://github.com/webpack/webpack/issues/11676
// const { name: packageName, version: packageVersion } = PACKAGE_JSON
const packageName = PACKAGE_JSON.name
const packageVersion = PACKAGE_JSON.version

const setupServer = async (serverOption, featureOption) => {
  await configurePid(serverOption)
  const { loggerExot } = await configureLog(serverOption)
  const serverExot = await configureServerExot(serverOption)
  await configureServer({ serverExot, logger: loggerExot, ...featureOption })
  serverExot.describeString = describeServerOption(
    serverExot.option,
    `${packageName}@${packageVersion}`,
    Object.entries(featureOption).map(([ key, value ]) => value !== undefined && `${key}: ${value}`)
  )

  const exotGroup = createExotGroup({
    id: 'exot:group-server',
    getOnExotError: (exotGroup) => (error) => {
      console.log('[exot-group-error]', error)
      return exotGroup.down()
    }
  })

  exotGroup.set(loggerExot)
  for (const { exotList } of serverExot.featureMap.values()) { // NOTE: this will up all featureExot before serverExot
    if (exotList && exotList.length) for (const exot of exotList) exotGroup.set(exot)
  }
  exotGroup.set(serverExot)

  setupSIGUSR2(resolve(tmpdir(), packageName, packageVersion))

  return {
    exotGroup,
    serverExot, loggerExot
  }
}

const setupServerExotGroup = async ({ exotGroup, serverExot, loggerExot }) => {
  const down = once(exotGroup.down) // trigger all exot down, the worst case those sync ones may still finish
  addExitListenerSync(down)
  addExitListenerAsync(down)
  await exotGroup.up()
  loggerExot.add(serverExot.describeString)
}

const runMode = async (modeName, optionData) => {
  switch (modeName) {
    case 'host':
      return setupServer({
        ...getPidOption(optionData),
        ...getServerExotOption(optionData),
        ...getLogOption(optionData)
      }, autoPathOption({
        rootPath: optionData.tryGetFirst('root-path'),
        ...getAuthCommonOption(optionData), ...getAuthSkipOption(optionData), ...getAuthFileOption(optionData), ...getAuthFileGroupOption(optionData),
        ...getFileOption(optionData),
        ...getExplorerOption(optionData),
        ...getWebSocketTunnelOption(optionData),
        ...getWeblogOption(optionData)
      })).then(setupServerExotGroup)
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
