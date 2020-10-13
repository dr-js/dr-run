import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

const WeblogFormatConfig = parseCompact('weblog-root-path/SP,O', parseCompactList(
  'weblog-route-index/SS,O',
  'weblog-route-root/SS,O',
  'weblog-index-title/SS,O'
))
const getWeblogOption = ({ tryGetFirst }) => ({
  weblogRootPath: tryGetFirst('weblog-root-path'),
  weblogRouteIndex: tryGetFirst('weblog-route-index') || 'index.html',
  weblogRouteRoot: tryGetFirst('weblog-route-root') || 't/',
  weblogIndexTitle: tryGetFirst('weblog-index-title') || 'Dr.Weblog'
})

export { WeblogFormatConfig, getWeblogOption }
