import { Preset, prepareOption } from '@dr-js/core/module/node/module/Option/preset'
import { getServerPackFormatConfig, LogFormatConfig, PidFormatConfig } from '@dr-js/node/module/server/share/option'
import { AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig } from '@dr-js/node/module/server/feature/Auth/option'

const { Config, parseCompact, parseCompactList } = Preset

const MODE_FORMAT_LIST = [
  getServerPackFormatConfig([
    parseCompact('root-path/SP|directory to use as server root'),
    LogFormatConfig,
    PidFormatConfig,
    AuthSkipFormatConfig,
    AuthFileFormatConfig,
    AuthFileGroupFormatConfig
  ]),
  parseCompact('generate-markdown,G/SP,O|expect root-path, load Markdown and generate server Weblog & index')
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
