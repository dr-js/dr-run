import { catchAsync } from '@dr-js/core/module/common/error.js'
import { objectMap } from '@dr-js/core/module/common/immutable/Object.js'

import { generateWeblogFromPath } from 'source/module/WeblogMarkdown/generate.js'

const WEBLOG_GENERATE_MARKDOWN = 'weblog.generate-markdown'

const ACTION_TYPE = { // NOTE: should always refer action type form here
  WEBLOG_GENERATE_MARKDOWN
}

const ACTION_CORE_MAP = { // all async
  [ WEBLOG_GENERATE_MARKDOWN ]: async ({ log, weblogRootPath, weblogRouteIndex, weblogRouteSource, weblogRouteOutput, weblogIndexTitle }) => {
    const { fileList } = await generateWeblogFromPath({ log, weblogRootPath, weblogRouteSource, weblogRouteOutput, weblogRouteIndex, weblogIndexTitle })
    return { fileList }
  }
}

const setupActionMap = ({
  actionCoreMap = ACTION_CORE_MAP,
  weblogRootPath,
  weblogRouteSource,
  weblogRouteOutput,
  weblogRouteIndex,
  weblogIndexTitle,
  loggerExot
}) => {
  const option = { log: loggerExot.add, weblogRootPath, weblogRouteIndex, weblogRouteSource, weblogRouteOutput, weblogIndexTitle }

  return objectMap(actionCoreMap, (actionFunc, actionType) => async (store, actionPayload) => {
    loggerExot.add(`[ActionBox|${actionType}]`)
    const { result, error } = await catchAsync(actionFunc, option) // NOTE: the call pattern
    return error ? { actionType, error: String(error) } : { actionType, ...result }
  })
}

export {
  ACTION_TYPE, ACTION_CORE_MAP,
  setupActionMap
}
