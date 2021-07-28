import { Preset } from '@dr-js/core/module/node/module/Option/preset.js'

const { parseCompact, parseCompactList } = Preset

const WeblogFormatConfig = parseCompact('weblog-root-path/SP,O', parseCompactList(
  'weblog-route-source/SS,O',
  'weblog-route-output/SS,O',
  'weblog-route-index/SS,O',
  'weblog-index-title/SS,O'
))
const getWeblogOption = ({ tryGetFirst }) => ({
  weblogRootPath: tryGetFirst('weblog-root-path'),
  weblogRouteSource: tryGetFirst('weblog-route-source') || 'w/',
  weblogRouteOutput: tryGetFirst('weblog-route-output') || 'W/',
  weblogRouteIndex: tryGetFirst('weblog-route-index') || 'index.html',
  weblogIndexTitle: tryGetFirst('weblog-index-title') || 'Dr.Weblog'
})

export { WeblogFormatConfig, getWeblogOption }
