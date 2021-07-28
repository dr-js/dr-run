import { Preset, prepareOption } from '@dr-js/core/module/node/module/Option/preset'
import { AuthCommonFormatConfig, AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig } from '@dr-js/core/module/node/server/Feature/Auth/option'
import { FileFormatConfig } from '@dr-js/core/module/node/server/Feature/File/option'
// import { WebSocketTunnelFormatConfig } from '@dr-js/core/module/node/server/Feature/WebSocketTunnelDev/option'
import { getServerExotFormatConfig, LogFormatConfig, PidFormatConfig } from '@dr-js/core/module/node/server/Feature/@/option'

import { WeblogFormatConfig } from 'source/server/feature/Weblog/option'

const { Config, parseCompactList } = Preset

const MODE_FORMAT_LIST = [
  getServerExotFormatConfig([
    ...parseCompactList(
      'root-path/SP|directory to use as server root, will auto set File and Weblog path'
    ),
    LogFormatConfig,
    PidFormatConfig,
    AuthCommonFormatConfig, AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig,
    FileFormatConfig,
    // WebSocketTunnelFormatConfig,
    WeblogFormatConfig
  ]),
  ...parseCompactList('generate-weblog,G/T|expect "root-path" or "weblog-root-path", load and generate server Weblog & index file')
]
const MODE_NAME_LIST = MODE_FORMAT_LIST.map(({ name }) => name)

const OPTION_CONFIG = {
  prefixENV: 'dr-run',
  formatList: [
    Config,
    ...parseCompactList(
      'help,h/T|show full help',
      'version,v/T|show version'
    ),
    ...MODE_FORMAT_LIST
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_NAME_LIST, parseOption, formatUsage }
