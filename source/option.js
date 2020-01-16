import { Preset, prepareOption } from '@dr-js/core/module/node/module/Option/preset'
import { getServerPackFormatConfig, LogFormatConfig, PidFormatConfig } from '@dr-js/node/module/server/share/option'
import { AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig } from '@dr-js/node/module/server/feature/Auth/option'

import { PATH_TEMP } from './configureServer'

const { Config, parseCompactList } = Preset

const MODE_FORMAT_LIST = [
  getServerPackFormatConfig([
    ...parseCompactList(
      'root-path/SP|directory to use as server root',
      `temp-path/SP,O|directory to save temp file, default to "root/${PATH_TEMP}"`
    ),
    LogFormatConfig,
    PidFormatConfig,
    AuthSkipFormatConfig,
    AuthFileFormatConfig,
    AuthFileGroupFormatConfig
  ]),
  ...parseCompactList('generate-markdown,G/SP,O|expect root-path, load Markdown and generate server Weblog & index')
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
