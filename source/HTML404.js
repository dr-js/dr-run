import { COMMON_LAYOUT, COMMON_STYLE } from '@dr-js/core/module/node/server/commonHTML.js'
import { escapeHTML } from '@dr-js/core/module/common/string.js'
import { isString } from '@dr-js/core/module/common/check.js'

const getHTML404 = ({
  URL_HTML_INDEX,
  sourceUrl,
  message
}) => COMMON_LAYOUT([
  '<title>Whoops, 404</title>',
  COMMON_STYLE({ boxReset: false })
], [
  '<h1>The 404 page, sorry...</h1>',
  sourceUrl && `<p>The URL seems not exist: "${escapeHTML(String(sourceUrl))}"</p>`,
  isString(message) && `<p>And there's an extra message: "${escapeHTML(message)}"</p>`,
  `<p><a href="${URL_HTML_INDEX}">Okay, back to main track!</a></p>`
])

export { getHTML404 }
