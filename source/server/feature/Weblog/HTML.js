import { COMMON_LAYOUT, COMMON_STYLE, COMMON_SCRIPT } from '@dr-js/core/module/common/module/HTML.js'
import { DR_BROWSER_SCRIPT_TAG } from '@dr-js/core/module/node/server/function.js'

import { initModal } from '@dr-js/core/module/node/server/Feature/@/HTML/Modal.js'
import { initLoadingMask } from '@dr-js/core/module/node/server/Feature/@/HTML/LoadingMask.js'
import { initAuthMask } from '@dr-js/core/module/node/server/Feature/Auth/HTML.js'

const getHTML = ({
  URL_AUTH_CHECK_ABBR, URL_ACTION_JSON_ABBR,
  ACTION_TYPE_WEBLOG_GENERATE_MARKDOWN
}) => COMMON_LAYOUT([
  '<title>weblog Admin</title>',
  COMMON_STYLE(),
  mainStyle
], [
  '<div id="control-panel" style="overflow-x: auto; white-space: nowrap; box-shadow: 0 0 8px 0 #888;"></div>',
  '<div id="main-panel" style="position: relative; overflow: auto; flex: 1; min-height: 0;"></div>',
  COMMON_SCRIPT({
    INIT: [ // NOTE: shorter after minify
      URL_AUTH_CHECK_ABBR, URL_ACTION_JSON_ABBR,
      ACTION_TYPE_WEBLOG_GENERATE_MARKDOWN
    ],
    initModal, initLoadingMask, initAuthMask,
    onload: onLoadFunc
  }),
  DR_BROWSER_SCRIPT_TAG()
])

const mainStyle = `<style>
* { font-family: monospace; }
</style>`

const onLoadFunc = () => {
  const {
    location,
    qS, cE, aCL,
    INIT: [
      URL_AUTH_CHECK_ABBR, URL_ACTION_JSON_ABBR,
      ACTION_TYPE_WEBLOG_GENERATE_MARKDOWN
    ],
    initModal, initLoadingMask, initAuthMask,
    Dr: { Common: { Immutable: { StateStore: { createStateStore } } } }
  } = window

  const initWeblogAdmin = async ({ authRevoke, authFetch }) => {
    const { withAlertModal } = initModal()
    const { initialLoadingMaskState, wrapLossyLoading } = initLoadingMask()

    const authFetchActionJSON = async (actionType, actionPayload = {}) => (await authFetch(`${URL_ACTION_JSON_ABBR}/${encodeURIComponent(actionType)}`, { method: 'POST', body: JSON.stringify(actionPayload) })).json()

    const loadingMaskStore = createStateStore(initialLoadingMaskState)

    const generateWeblog = wrapLossyLoading(loadingMaskStore, async () => {
      const { fileList } = await authFetchActionJSON(ACTION_TYPE_WEBLOG_GENERATE_MARKDOWN)
      await withAlertModal(`generated:\n  ${fileList.join('\n  ')}`)
    })

    aCL(qS('#control-panel'), [
      cE('button', { innerText: 'Generate Weblog', onclick: generateWeblog }),
      cE('button', { innerText: 'Auth Revoke', onclick: () => authRevoke().then(() => location.reload()) })
    ])

    if (__DEV__) window.DEBUG = { loadingMaskStore }
  }

  initAuthMask({
    URL_AUTH_CHECK_ABBR,
    onAuthPass: initWeblogAdmin
  })
}

export { getHTML }
