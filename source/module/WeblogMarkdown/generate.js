import { resolve, join, dirname, basename, extname } from 'path'
import { promises as fsAsync } from 'fs'

import { escapeHTML } from '@dr-js/core/module/common/string'
import { compareString } from '@dr-js/core/module/common/compare'
import { COMMON_LAYOUT, COMMON_STYLE } from '@dr-js/core/module/node/server/commonHTML'
import { PATH_TYPE, toPosixPath } from '@dr-js/core/module/node/file/Path'
import { getDirInfoList } from '@dr-js/core/module/node/file/Directory'

import { getMarkdownHeaderLink } from '@dr-js/dev/module/node/export/renderMarkdown' // TODO: move to `@dr-js/node`?

import { highlightMarkdownToHTML, highlightStyleString, Marked } from './external'

const joinText = (...args) => args.filter(Boolean).join('\n')

const REGEXP_DATE = /\d\d\d\d\/\d\d\/\d\d/ // lock date format to YYYY/MM/DD

const getBodyStyleString = ({ limitWidth = true }) => `<style>
body {
  margin: 0 auto; padding: 0 8px;
  line-height: 1.4; word-break: break-word;
  font-family: "Open Sans", "Helvetica Neue", Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
}
</style>
${!limitWidth ? '' : `<style>
body { max-width: 800px; }
body > p, body > ul { max-width: 600px; margin-left: auto; margin-right: auto; }
</style>`}`

const markdownStyleString = `<style>
ul { padding-inline-start: 1em; list-style: circle; }
pre { overflow: auto; font-family: monospace; }
pre, code { border: solid #888; border-width: 0 1px; }
pre > code { border: none; }
blockquote { border-left: 0.4em solid #888; }
</style>`

const parseMarkedToken = (tokenData) => {
  const getMetaString = (key) => tokenData.links[ key ] ? tokenData.links[ key ].title : ''

  const metaEditLogList = getMetaString('meta:edit-log').split(',').map((v) => v.trim())
  if (!metaEditLogList.length || !metaEditLogList.every((v) => REGEXP_DATE.test(v))) throw new Error('[parseMarkedToken] expect meta link: [meta:edit-log]: # "yyyy/mm/dd"')

  const metaEditFirst = metaEditLogList[ 0 ]
  const metaEditLogCount = metaEditLogList.length
  const metaEditLogString = `${metaEditFirst}${metaEditLogCount >= 2 ? ` (Edit#${metaEditLogCount})` : ''}`
  const metaEditLogFullString = `${metaEditFirst}${metaEditLogCount >= 2 ? ` (Edit ${metaEditLogList.slice(1).join(', ')})` : ''}`

  const metaTitle = getMetaString('meta:title')
  if (!metaTitle) throw new Error('[parseMarkedToken] expect meta link: [meta:title]: # "Title here"')

  const metaKeywords = getMetaString('meta:keywords')
    .split(',')
    .map((v) => v.trim())
    .join(', ')
  const metaDescription = getMetaString('meta:description')

  const headerTokenList = tokenData.filter((v) => v.type === 'heading') // # some title // {type:"heading", depth:"1", text:"some title"}
  const headerDepthMap = [ ...new Set(headerTokenList.map((v) => v.depth)) ].sort().reduce((o, v, i) => {
    o[ v ] = i + 1
    return o
  }, {})
  const headerLinkListString = headerTokenList.map(v => `${'* '.repeat(headerDepthMap[ v.depth ])}${getMarkdownHeaderLink(v.text)}`).join('\n')

  const hasCode = tokenData.find(({ type }) => type === 'code') // ```js\n``` // {type:"code", lang:"js", text:""}

  return {
    metaEditFirst, metaEditLogString, metaEditLogFullString,
    metaTitle, metaKeywords, metaDescription,
    headerLinkListString,
    hasCode
  }
}

const processFile = async (file, weblogRouteRoot, log) => {
  __DEV__ && console.log('[processFile]', file)
  const markdownString = String(await fsAsync.readFile(file))
  const tokenData = Marked.lexer(markdownString)
  const {
    metaEditFirst, metaEditLogString, metaEditLogFullString,
    metaTitle, metaKeywords, metaDescription,
    headerLinkListString,
    hasCode
  } = parseMarkedToken(tokenData)

  // serve total 3 type of files:
  // - Markdown (file.md, already exist)
  // - HTML (file.html)
  // - highlighted Markdown in HTML (file.md.html)
  const fileNameBase = basename(file, extname(file))
  const fileNameMarkdown = `${fileNameBase}.md`
  const fileNameHTML = `${fileNameBase}.html`
  const fileNameMarkdownHTML = `${fileNameBase}.md.html`

  await fsAsync.writeFile(join(dirname(file), fileNameHTML), COMMON_LAYOUT(
    [
      `<title>${escapeHTML(metaTitle)}</title>`,
      metaKeywords ? `<meta name="keywords" content="${escapeHTML(metaKeywords)}">` : '',
      metaDescription ? `<meta name="description" content="${escapeHTML(metaDescription)}">` : '',
      COMMON_STYLE({ boxReset: false, bodyReset: false }),
      getBodyStyleString({ limitWidth: true }),
      markdownStyleString,
      hasCode ? highlightStyleString : ''
    ],
    [
      // Marked(`# ${metaTitle}`),
      // Marked(`###### ${metaEditLogString} ${metaKeywords || ''}`),
      // metaDescription && Marked(`###### ${metaDescription}`),
      Marked([
        `# ${metaTitle}`,
        `> ${metaEditLogFullString}  `,
        metaKeywords && `> ${metaKeywords}  `,
        metaDescription && `> ${metaDescription}  `,
        headerLinkListString
      ].filter(Boolean).join('\n')),
      Marked.parser(Object.assign(tokenData, { links: tokenData.links }))
    ]
  ))
  log && log(`output file: ${fileNameHTML}`)

  await fsAsync.writeFile(join(dirname(file), fileNameMarkdownHTML), COMMON_LAYOUT(
    [
      `<title>${escapeHTML(metaTitle)}</title>`,
      metaKeywords ? `<meta name="keywords" content="${escapeHTML(metaKeywords)}">` : '',
      metaDescription ? `<meta name="description" content="${escapeHTML(metaDescription)}">` : '',
      COMMON_STYLE({ boxReset: false, bodyReset: false }),
      getBodyStyleString({ limitWidth: false }),
      // markdownStyleString,
      highlightStyleString
    ],
    [
      `<pre><code class="hljs">${highlightMarkdownToHTML(markdownString)}</code></pre>`
    ]
  ))
  log && log(`output file: ${fileNameMarkdownHTML}`)

  const indexTagHTMLString = joinText(
    '<p>',
    `<a href="${encodeURI(toPosixPath(join(weblogRouteRoot, fileNameMarkdown)))}" title="get source .md">📄</a>`,
    `<a href="${encodeURI(toPosixPath(join(weblogRouteRoot, fileNameMarkdownHTML)))}" title="read .md.html">📑</a>`,
    `<a href="${encodeURI(toPosixPath(join(weblogRouteRoot, fileNameHTML)))}">${escapeHTML(metaTitle)}</a>`,
    metaEditLogString,
    `<br><code>${metaDescription}</code>`,
    '</p>'
  )

  return {
    indexTagHTMLString,
    metaTitle, metaEditFirst // for list sorting
  }
}

const generateWeblogFromPath = async ({
  log,
  weblogRootPath, // should be public accessible
  weblogRouteIndex = 'index.html',
  weblogRouteRoot = 't/',
  weblogIndexTitle = 'Dr.Weblog'
}) => {
  // ## weblog path structure
  // ${weblogRootPath}/
  //   ${weblogRouteIndex} (generated index)
  //   ${weblogRouteRoot}/
  //     title-0.md (source)
  //     title-0.html (generated)
  //     title-0.md.html (generated)

  __DEV__ && console.log('[generateWeblogFromPath]', weblogRootPath)

  const fileList = (await getDirInfoList(resolve(weblogRootPath, weblogRouteRoot)))
    .map(({ type, name, path }) => type === PATH_TYPE.File && name.endsWith('.md') && path)
    .filter(Boolean)
  log && log(`got file: ${fileList.length}`)

  const fileInfoList = []
  for (const file of fileList) fileInfoList.push(await processFile(file, weblogRouteRoot, log))
  // TODO: also generate gzip files?

  await fsAsync.writeFile(resolve(weblogRootPath, weblogRouteIndex), COMMON_LAYOUT(
    [
      `<title>${escapeHTML(weblogIndexTitle)}</title>`,
      COMMON_STYLE({ boxReset: false, bodyReset: false }),
      getBodyStyleString({ limitWidth: true })
    ],
    [
      `<h1>${escapeHTML(weblogIndexTitle)}</h1>`,
      ...fileInfoList
        .sort((a, b) => compareString(b.metaEditFirst, a.metaEditFirst) || compareString(b.metaTitle, a.metaTitle))
        .map((v) => v.indexTagHTMLString),
      `<h6>${new Date().toISOString()}</h6>`
    ]
  ))
  log && log(`output: ${weblogRouteIndex}`)

  return {
    fileList
  }
}

export { generateWeblogFromPath }
