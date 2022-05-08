import { BASIC_EXTENSION_MAP } from '@dr-js/core/module/common/module/MIME.js'
import { responderEndWithRedirect } from '@dr-js/core/module/node/server/Responder/Common.js'
import { responderSendBufferCompress, prepareBufferData } from '@dr-js/core/module/node/server/Responder/Send.js'

import { ACTION_TYPE as ACTION_TYPE_WEBLOG } from 'source/module/ActionJSON/weblog.js'

import { getHTML } from './HTML.js'

const setup = async ({
  name = 'feature:weblog',
  loggerExot, routePrefix = '',
  featureAuth: { URL_AUTH_CHECK_ABBR },
  featureActionJSON: { actionMap, URL_ACTION_JSON_ABBR }, // need `PATH_*` & `STATUS_SERVER_COMMON` action
  featureFile: { fileRootPathPublic, URL_FILE_SERVE_PUBLIC_ABBR },

  weblogRootPath, // should be the same or under public file serve path
  weblogRouteSource,
  weblogRouteOutput,
  weblogRouteIndex,
  weblogIndexTitle,

  URL_HTML = `${routePrefix}/weblog`, // redirect to URL_HTML_INDEX
  URL_HTML_INDEX = `${URL_FILE_SERVE_PUBLIC_ABBR}/${weblogRouteIndex}`,
  URL_HTML_ADMIN = `${routePrefix}/weblog-admin`
}) => {
  // const ACTION_TYPE_WEBLOG_GENERATE_MARKDOWN = ACTION_TYPE_WEBLOG.WEBLOG_GENERATE_MARKDOWN // TODO: check: https://github.com/terser/terser/issues/851
  const { WEBLOG_GENERATE_MARKDOWN: ACTION_TYPE_WEBLOG_GENERATE_MARKDOWN } = ACTION_TYPE_WEBLOG
  if (!actionMap[ ACTION_TYPE_WEBLOG_GENERATE_MARKDOWN ]) throw new Error(`expect ActionJSON provide: ${ACTION_TYPE_WEBLOG_GENERATE_MARKDOWN}`)
  if (!fileRootPathPublic || !weblogRootPath.startsWith(fileRootPathPublic)) throw new Error('expect weblogRootPath under fileRootPathPublic')

  const HTMLBufferData = prepareBufferData(Buffer.from(getHTML({
    URL_AUTH_CHECK_ABBR, URL_ACTION_JSON_ABBR,
    ACTION_TYPE_WEBLOG_GENERATE_MARKDOWN
  })), BASIC_EXTENSION_MAP.html)

  const routeList = [
    [ URL_HTML, 'GET', (store) => responderEndWithRedirect(store, { redirectUrl: URL_HTML_INDEX }) ],
    [ URL_HTML_ADMIN, 'GET', (store) => responderSendBufferCompress(store, HTMLBufferData) ]
  ].filter(Boolean)

  return {
    weblogRootPath,
    weblogRouteSource,
    weblogRouteOutput,
    weblogRouteIndex,
    weblogIndexTitle,

    URL_HTML,
    URL_HTML_INDEX,
    URL_HTML_ADMIN,
    routeList,
    name
  }
}

export { setup }
