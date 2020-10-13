import { catchAsync } from '@dr-js/core/module/common/error'
import { objectMap } from '@dr-js/core/module/common/immutable/Object'

import { generateWeblogFromPath } from 'source/module/WeblogMarkdown/generate'

const WEBLOG_GENERATE_MARKDOWN = 'weblog.generate-markdown'

const ACTION_TYPE = { // NOTE: should always refer action type form here
  WEBLOG_GENERATE_MARKDOWN
}

const ACTION_CORE_MAP = { // all async
  [ WEBLOG_GENERATE_MARKDOWN ]: async ({ log, weblogRootPath, weblogRouteIndex, weblogRouteRoot, weblogIndexTitle }) => {
    const { fileList } = await generateWeblogFromPath({ log, weblogRootPath, weblogRouteIndex, weblogRouteRoot, weblogIndexTitle })
    return { fileList }
  }
}

const setupActionMap = ({
  actionCoreMap = ACTION_CORE_MAP,
  weblogRootPath,
  weblogRouteIndex,
  weblogRouteRoot,
  weblogIndexTitle,
  logger
}) => {
  const option = { log: logger.add, weblogRootPath, weblogRouteIndex, weblogRouteRoot, weblogIndexTitle }

  return objectMap(actionCoreMap, (actionFunc, actionType) => async (store, actionPayload) => {
    logger.add(`[ActionBox|${actionType}]`)
    const { result, error } = await catchAsync(actionFunc, option) // NOTE: the call pattern
    return error ? { actionType, error: String(error) } : { actionType, ...result }
  })
}

export {
  ACTION_TYPE, ACTION_CORE_MAP,
  setupActionMap
}
