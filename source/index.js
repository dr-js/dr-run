import { resolve } from 'path'

import { readFileAsync } from 'dr-js/module/node/file/function'

import { configureLogger } from 'dr-server/module/configure/logger'
import { configureFilePid } from 'dr-server/module/configure/filePid'
import { configureServerBase, getServerSNIOption } from 'dr-server/module/configure/serverBase'

import { parseOption, formatUsage } from './option'
import { generateMarkdownHTML } from './generateMarkdownHTML'
import { configureResponder } from './configureResponder'
import { name as packageName, version as packageVersion } from '../package.json'

const loadSNISSL = async (SNISSLConfig, SNIConfig = {}) => {
  for (const [ hostname, { key, cert, chain } ] of Object.entries(JSON.parse(await readFileAsync(SNISSLConfig)))) {
    SNIConfig[ hostname ] = {
      fileSSLKey: resolve(SNISSLConfig, key),
      fileSSLCert: resolve(SNISSLConfig, cert),
      fileSSLChain: resolve(SNISSLConfig, chain)
    }
  }
  return getServerSNIOption(SNIConfig)
}

const startServer = async ({ getOptionOptional, getSingleOption, getSingleOptionOptional }) => {
  const SNISSLConfig = getOptionOptional('sni-ssl-config')

  await configureFilePid({
    filePid: getSingleOptionOptional('pid-file'),
    shouldIgnoreExistPid: getOptionOptional('pid-ignore-exist')
  })

  const { server, start, option } = await configureServerBase({
    hostname: getSingleOptionOptional('hostname'),
    port: getSingleOptionOptional('port'),
    protocol: getOptionOptional('https') ? 'https:' : 'http:',
    fileSSLKey: getSingleOptionOptional('file-SSL-key'),
    fileSSLCert: getSingleOptionOptional('file-SSL-cert'),
    fileSSLChain: getSingleOptionOptional('file-SSL-chain'),
    fileSSLDHParam: getSingleOptionOptional('file-SSL-dhparam'),
    ...(SNISSLConfig ? await loadSNISSL(SNISSLConfig) : {})
  })

  const logger = await configureLogger({
    pathLogDirectory: getSingleOptionOptional('log-path'),
    logFilePrefix: getSingleOptionOptional('log-file-prefix') || '[dr-run]'
  })

  await configureResponder({
    fileAuth: getSingleOptionOptional('auth-file'),
    shouldAuthGen: Boolean(getOptionOptional('auth-gen')),
    authGenTag: getSingleOptionOptional('auth-gen-tag'),
    authGenSize: getSingleOptionOptional('auth-gen-size'),
    authGenTokenSize: getSingleOptionOptional('auth-gen-token-size'),
    authGenTimeGap: getSingleOptionOptional('auth-gen-time-gap'),

    pathAuthGroup: getSingleOptionOptional('auth-group-path'),
    authGroupDefaultTag: getSingleOptionOptional('auth-group-default-tag'),
    authGroupKeySuffix: getSingleOptionOptional('auth-group-key-suffix'),

    rootPath: getSingleOption('root-path')
  }, { server, option, logger })

  await start()
  logger.add(`[SERVER UP] version: ${packageVersion}, pid: ${process.pid}, at: ${option.baseUrl}`)
}

const main = async () => {
  const optionData = await parseOption()

  if (optionData.getSingleOptionOptional('generate-markdown')) {
    return generateMarkdownHTML(optionData.getSingleOption('generate-markdown')).catch((error) => {
      console.warn(`[Error]`, error.stack || error)
      process.exit(2)
    })
  } else if (optionData.getSingleOptionOptional('hostname')) {
    return startServer(optionData).catch((error) => {
      console.warn(`[Error]`, error.stack || error)
      process.exit(2)
    })
  } else {
    return optionData.getOptionOptional('version')
      ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  '))
      : console.log(formatUsage(null, optionData.getOptionOptional('help') ? null : 'simple'))
  }

}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
