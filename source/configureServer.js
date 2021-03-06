import { resolve } from 'path'
import { gunzipSync } from 'zlib'

import { objectPickKey } from '@dr-js/core/module/common/immutable/Object'
import { BASIC_EXTENSION_MAP } from '@dr-js/core/module/common/module/MIME'

import { createDirectory } from '@dr-js/core/module/node/file/Directory'
import { responderEndWithRedirect } from '@dr-js/core/module/node/server/Responder/Common'
import { prepareBufferData, responderSendBufferCompress } from '@dr-js/core/module/node/server/Responder/Send'

import { setupActionMap as setupActionMapStatus, ACTION_CORE_MAP as ACTION_CORE_MAP_STATUS, ACTION_TYPE as ACTION_TYPE_STATUS } from '@dr-js/node/module/module/ActionJSON/status'
import { setupActionMap as setupActionMapPath, ACTION_CORE_MAP as ACTION_CORE_MAP_PATH } from '@dr-js/node/module/module/ActionJSON/path'
import { ACTION_CORE_MAP as ACTION_CORE_MAP_PATH_EXTRA_ARCHIVE } from '@dr-js/node/module/module/ActionJSON/pathExtraArchive'

import { setup as setupAuth } from '@dr-js/node/module/server/feature/Auth/setup'
import { setup as setupPermission } from '@dr-js/node/module/server/feature/Permission/setup'
import { setup as setupActionJSON } from '@dr-js/node/module/server/feature/ActionJSON/setup'
import { setup as setupFile } from '@dr-js/node/module/server/feature/File/setup'
import { setup as setupExplorer } from '@dr-js/node/module/server/feature/Explorer/setup'
import { setup as setupWebSocketTunnel } from '@dr-js/node/module/server/feature/WebSocketTunnelDev/setup'

import { configureFeature } from '@dr-js/node/module/server/share/configure'

import { setupActionMap as setupActionMapWeblog } from 'source/module/ActionJSON/weblog'
import { setup as setupWeblog } from 'source/server/feature/Weblog/setup'

const PATH_PUBLIC = 'file/[PUBLIC]/'
const PATH_TEMP = 'file/[TEMP]/'

// NOTE: this is a highly customized server
//   providing public weblog and explorer, and optional webSocketTunnelHost
// the file structure:
//   root/ (fileRootPath)
//     file/
//       [TEMP]/ (fileUploadMergePath)
//       [PUBLIC]/ (fileRootPathPublic & weblogRootPath)
//         index.html
//         t/*.md

const autoPathOption = ({
  rootPath, // normally just set this

  fileRootPath = rootPath,
  fileRootPathPublic = resolve(fileRootPath, PATH_PUBLIC),
  fileUploadMergePath = resolve(fileRootPath, PATH_TEMP),

  weblogRootPath = fileRootPathPublic,
  // weblogRouteIndex, weblogRouteRoot, weblogIndexTitle

  ...extra
}) => ({
  fileRootPath,
  fileRootPathPublic,
  fileUploadMergePath,

  weblogRootPath,
  ...extra
})

const configureServer = async ({
  serverExot, loggerExot, routePrefix = '',

  authKey,
  authSkip,
  authFile,
  authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix,

  fileRootPath, fileRootPathPublic, fileUploadMergePath,

  webSocketTunnelHost,

  weblogRootPath, weblogRouteIndex, weblogRouteRoot, weblogIndexTitle
}) => {
  await createDirectory(fileRootPath)
  await createDirectory(fileRootPathPublic)
  await createDirectory(fileUploadMergePath)

  const featureAuth = await setupAuth({
    loggerExot, routePrefix,
    authKey,
    authSkip,
    authFile,
    authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix
  })
  const featurePermission = await setupPermission({
    loggerExot, routePrefix,
    permissionType: 'allow'
  })
  const featureActionJSON = fileRootPath && await setupActionJSON({
    loggerExot, routePrefix, featureAuth, featurePermission,
    actionMap: {
      ...setupActionMapWeblog({ weblogRootPath, weblogRouteIndex, weblogRouteRoot, weblogIndexTitle, loggerExot }),
      ...setupActionMapStatus({ rootPath: fileRootPath, loggerExot }),
      ...setupActionMapPath({ rootPath: fileRootPath, loggerExot, actionCoreMap: { ...ACTION_CORE_MAP_PATH, ...ACTION_CORE_MAP_PATH_EXTRA_ARCHIVE } })
    },
    actionMapPublic: {
      ...setupActionMapStatus({ rootPath: fileRootPath, loggerExot, actionCoreMap: objectPickKey(ACTION_CORE_MAP_STATUS, [ ACTION_TYPE_STATUS.STATUS_TIMESTAMP, ACTION_TYPE_STATUS.STATUS_TIME_ISO ]) })
    }
  })
  const featureFile = fileRootPath && await setupFile({
    loggerExot, routePrefix, featureAuth, featurePermission,
    fileRootPath, fileRootPathPublic, fileUploadMergePath
  })
  const featureExplorer = await setupExplorer({
    loggerExot, routePrefix, featureAuth, featureActionJSON, featureFile
  })
  const featureWebSocketTunnel = webSocketTunnelHost && await setupWebSocketTunnel({
    loggerExot, routePrefix, featureAuth: await setupAuth({ // TODO: NOTE: allow setting with a different auth priority
      loggerExot, routePrefix,
      authKey,
      authSkip: !authFileGroupPath && !authFile, // last
      authFile: !authFileGroupPath && authFile, // second
      authFileGroupPath, authFileGroupDefaultTag, authFileGroupKeySuffix // first
    }),
    webSocketTunnelHost
  })
  const featureWeblog = await setupWeblog({
    loggerExot, routePrefix, featureAuth, featureActionJSON, featureFile,
    weblogRootPath, weblogRouteIndex, weblogRouteRoot, weblogIndexTitle
  })

  configureFeature({
    serverExot, loggerExot, isFavicon: false,
    rootRouteResponder: (store) => responderEndWithRedirect(store, { redirectUrl: featureWeblog.URL_HTML_INDEX }),
    preRouteList: [
      [ [ '/favicon', '/favicon.ico' ], 'GET', createResponderFavicon() ],
      [ '/robots.txt', 'GET', createResponderRobotsTxt() ] ]
  }, [
    featureAuth,
    featurePermission,
    featureActionJSON,
    featureFile,
    featureExplorer,
    featureWebSocketTunnel,
    featureWeblog
  ])
}

const BASE64_GZIP_FAVICON_ICO = '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'
const createResponderFavicon = () => {
  const faviconBufferData = prepareBufferData(gunzipSync(Buffer.from(BASE64_GZIP_FAVICON_ICO, 'base64')), BASIC_EXTENSION_MAP.ico)
  return (store) => responderSendBufferCompress(store, faviconBufferData)
}

const createResponderRobotsTxt = () => {
  const faviconBufferData = prepareBufferData(Buffer.from('User-agent: *\nDisallow:'), BASIC_EXTENSION_MAP.txt)
  return (store) => responderSendBufferCompress(store, faviconBufferData)
}

export { autoPathOption, configureServer }
