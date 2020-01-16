import { describeServerPack } from '@dr-js/core/module/node/server/Server'

import { configureLog } from '@dr-js/node/module/module/Log'
import { configurePid } from '@dr-js/node/module/module/Pid'
import { configureServerPack } from '@dr-js/node/module/module/ServerPack'
import { getServerPackOption, getLogOption, getPidOption } from '@dr-js/node/module/server/share/option'
import { getAuthSkipOption, getAuthFileOption, getAuthFileGroupOption } from '@dr-js/node/module/server/feature/Auth/option'

import { generateMarkdownHTML } from './markdown/generateMarkdownHTML'
import { configureServer } from './configureServer'
import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const startServer = async (serverOption, featureOption) => {
  await configurePid(serverOption)
  const serverPack = await configureServerPack(serverOption)
  const logger = await configureLog(serverOption)
  await configureServer({ serverPack, logger, ...featureOption })
  await serverPack.start()
  logger.add(describeServerPack(
    serverPack.option,
    `${packageName}@${packageVersion}`,
    Object.entries(featureOption).map(([ key, value ]) => value !== undefined && `${key}: ${value}`)
  ))
}

const runMode = async (modeName, optionData) => {
  switch (modeName) {
    case 'host':
      return startServer({
        ...getPidOption(optionData),
        ...getServerPackOption(optionData),
        ...getLogOption(optionData)
      }, {
        rootPath: optionData.getFirst('root-path'),
        tempPath: optionData.tryGetFirst('temp-path'),
        ...getAuthSkipOption(optionData),
        ...getAuthFileOption(optionData),
        ...getAuthFileGroupOption(optionData)
      })
    case 'generate-markdown':
      return generateMarkdownHTML(optionData.getFirst('generate-markdown'))
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
