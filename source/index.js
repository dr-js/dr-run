import { resolve } from 'path'

import { readFileAsync } from 'dr-js/module/node/file/function'

import { configureLog } from 'dr-server/module/share/configure/log'
import { configurePid } from 'dr-server/module/share/configure/pid'
import { configureServer, getServerSNIOption } from 'dr-server/module/share/configure/server'
import { getServerOption, getLogOption, getPidOption } from 'dr-server/module/share/option'
import { getAuthSkipOption, getAuthFileOption, getAuthFileGroupOption } from 'dr-server/module/feature/Auth/option'

import { generateMarkdownHTML } from './markdown/generateMarkdownHTML'
import { configureResponder } from './configureResponder'
import { MODE_NAME_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const loadSNISSL = async (SNISSLConfig, SNIConfig = {}) => {
  const fromSNISSLConfig = (path) => resolve(SNISSLConfig, '..', path)
  for (const [ hostname, { key, cert, chain } ] of Object.entries(JSON.parse(await readFileAsync(SNISSLConfig)))) {
    SNIConfig[ hostname ] = {
      fileSSLKey: fromSNISSLConfig(key),
      fileSSLCert: fromSNISSLConfig(cert),
      fileSSLChain: fromSNISSLConfig(chain)
    }
  }
  return getServerSNIOption(SNIConfig)
}

const startServer = async (optionData) => {
  const { getFirst, tryGetFirst } = optionData
  const SNISSLConfig = tryGetFirst('sni-ssl-config')

  await configurePid(getPidOption(optionData))

  const { server, start, option } = await configureServer({
    ...getServerOption(optionData),
    ...(SNISSLConfig ? await loadSNISSL(SNISSLConfig) : {})
  })

  const logger = await configureLog(getLogOption(optionData))

  await configureResponder({
    ...getAuthSkipOption(optionData),
    ...getAuthFileOption(optionData),
    ...getAuthFileGroupOption(optionData),
    rootPath: getFirst('root-path')
  }, { server, option, logger })

  await start()
  logger.add(`[SERVER UP] version: ${packageVersion}, pid: ${process.pid}, at: ${option.baseUrl}`)
}

const runMode = async (modeName, optionData) => {
  switch (modeName) {
    case 'host':
      return startServer(optionData)
    case 'generate-markdown':
      return generateMarkdownHTML(optionData.getFirst('generate-markdown'))
  }
}

const main = async () => {
  const optionData = await parseOption()
  const modeName = MODE_NAME_LIST.find((name) => optionData.tryGet(name))

  if (!modeName) {
    return optionData.tryGet('version')
      ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  '))
      : console.log(formatUsage(null, optionData.tryGet('help') ? null : 'simple'))
  }

  await runMode(modeName, optionData).catch((error) => {
    console.warn(`[Error] in mode: ${modeName}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
