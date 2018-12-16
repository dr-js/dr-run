import { ConfigPresetNode, prepareOption } from 'dr-js/module/node/module/Option'
import {
  getServerFormatConfig,
  AuthFormatConfig,
  AuthGroupFormatConfig
} from 'dr-server/module/option'

const { SinglePath, BooleanFlag, Config } = ConfigPresetNode

const OPTION_CONFIG = {
  prefixENV: 'dr-run',
  formatList: [
    Config,
    { ...BooleanFlag, name: 'help', shortName: 'h' },
    { ...BooleanFlag, name: 'version', shortName: 'v' },
    { ...BooleanFlag, name: 'debug', description: 'more log for debugging' },

    {
      ...SinglePath,
      optional: true,
      name: 'generate-markdown',
      shortName: 'G',
      description: 'load Markdown and generate server WebLog & index'
    },

    getServerFormatConfig([
      AuthFormatConfig,
      AuthGroupFormatConfig,
      { ...SinglePath, optional: true, name: 'root-path' },
      { ...SinglePath, optional: true, name: 'sni-ssl-config', description: 'SNI SSL JSON { [hostname]: { key, cert, chain } }' }
    ])
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { parseOption, formatUsage }
