import { resolve, join, basename, extname } from 'node:path'

import { escapeHTML } from '@dr-js/core/module/common/string.js'
import { compareString } from '@dr-js/core/module/common/compare.js'
import { COMMON_LAYOUT, COMMON_STYLE } from '@dr-js/core/module/common/module/HTML.js'
import { PATH_TYPE, toPosixPath } from '@dr-js/core/module/node/fs/Path.js'
import { readText, writeText } from '@dr-js/core/module/node/fs/File.js'
import { getDirInfoList, createDirectory } from '@dr-js/core/module/node/fs/Directory.js'
import { compressGzBrFileAsync } from '@dr-js/core/module/node/module/Archive/function.js'

import { getMarkdownHeaderLink } from '@dr-js/dev/module/node/export/renderMarkdown.js'

import { highlightMarkdownToHTML, highlightStyleString, Marked } from './external.js'

const joinText = (...args) => args.filter(Boolean).join('\n')

const REGEXP_DATE = /\d\d\d\d\/\d\d\/\d\d/ // lock date format to YYYY/MM/DD

const getBodyStyleString = ({ limitWidth = true }) => `<style>
body {
  margin: 0 auto; padding: 0 8px;
  font-size: 16px; line-height: 1.4; word-break: break-word;
  font-family: "Open Sans", "Helvetica Neue", Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
}
code { font-size: 0.8em; }
</style>
${!limitWidth ? '' : `<style>
body { max-width: 800px; }
body > p, body > ul { max-width: 600px; margin-left: auto; margin-right: auto; }
</style>`}`

const markdownStyleString = `<style>
ul { padding-inline: 1em; list-style: circle; }
p, pre { overflow: auto; }
pre, code { border: solid #888; border-width: 0 1px; }
pre > code { border: none; }
blockquote { margin-inline: 1em; border-left: 0.4em solid #888; }
</style>`

const biggerTextButtonBodyString = `<script>
document.body.appendChild(Object.assign(document.createElement('button'), {
  innerText: '++Text',
  style: 'position: fixed; bottom: 4px; right: 4px;',
  onclick: () => { document.body.style.fontSize = Math.ceil(parseInt(document.body.style.fontSize || 16) + 1) + 'px' }
}))
</script>`

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

const processFile = async (
  outputFile, log,
  file, weblogRouteSource, weblogRouteOutput
) => {
  __DEV__ && console.log('[processFile]', file)
  const markdownString = await readText(file)
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

  await outputFile([ weblogRouteOutput, fileNameHTML ], [
    `<title>${escapeHTML(metaTitle)}</title>`,
    metaKeywords ? `<meta name="keywords" content="${escapeHTML(metaKeywords)}">` : '',
    metaDescription ? `<meta name="description" content="${escapeHTML(metaDescription)}">` : '',
    COMMON_STYLE({ boxReset: false, bodyReset: false }),
    getBodyStyleString({ limitWidth: true }),
    markdownStyleString,
    hasCode ? highlightStyleString : ''
  ], [
    Marked([
      `# ${metaTitle}`,
      `> ${metaEditLogFullString}  `, // NOTE: 2 extra space for line-break
      metaKeywords && `> ${metaKeywords}  `,
      metaDescription && `> \`${metaDescription}\`  `,
      headerLinkListString
    ].filter(Boolean).join('\n')),
    Marked.parser(Object.assign(tokenData, { links: tokenData.links })),
    biggerTextButtonBodyString
  ])
  log && log(`output file: ${fileNameHTML}`)

  await outputFile([ weblogRouteOutput, fileNameMarkdownHTML ], [
    `<title>${escapeHTML(metaTitle)}</title>`,
    metaKeywords ? `<meta name="keywords" content="${escapeHTML(metaKeywords)}">` : '',
    metaDescription ? `<meta name="description" content="${escapeHTML(metaDescription)}">` : '',
    COMMON_STYLE({ boxReset: false, bodyReset: false }),
    getBodyStyleString({ limitWidth: false }),
    // markdownStyleString, // no outer markdown style, just a big code text box
    highlightStyleString
  ], [
    `<pre><code class="hljs">${highlightMarkdownToHTML(markdownString)}</code></pre>`
  ])
  log && log(`output file: ${fileNameMarkdownHTML}`)

  const indexTagHTMLString = joinText(
    '<p>',
    `<a href="${encodeURI(toPosixPath(join(weblogRouteSource, fileNameMarkdown)))}" title="get source .md">📄</a>`,
    `<a href="${encodeURI(toPosixPath(join(weblogRouteOutput, fileNameMarkdownHTML)))}" title="read .md.html">📑</a>`,
    `<a href="${encodeURI(toPosixPath(join(weblogRouteOutput, fileNameHTML)))}">${escapeHTML(metaTitle)}</a>`,
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
  weblogRouteSource = 'w/',
  weblogRouteOutput = 'W/',
  weblogRouteIndex = 'index.html',
  weblogIndexTitle = 'Dr.Weblog'
}) => {
  // ## weblog path structure
  // ${weblogRootPath}/
  //   ${weblogRouteIndex} (generated index)
  //   ${weblogRouteSource}/
  //     title-0.md
  //   ${weblogRouteOutput}/ (generated)
  //     title-0.html
  //     title-0.html.gz
  //     title-0.md.html
  //     title-0.md.html.gz

  __DEV__ && console.log('[generateWeblogFromPath]', weblogRootPath)

  const fileList = (await getDirInfoList(resolve(weblogRootPath, weblogRouteSource))) // single level only
    .map(({ type, name, path }) => type === PATH_TYPE.File && name.endsWith('.md') && path)
    .filter(Boolean)
  log && log(`got file: ${fileList.length}`)
  __DEV__ && console.log('[fileList]', fileList)

  const outputFileList = []
  const outputFile = async (extraPathList = [], extraHeadList = [], extraBodyList = []) => {
    const path = resolve(weblogRootPath, ...extraPathList)
    outputFileList.push(path)
    await writeText(path, COMMON_LAYOUT(extraHeadList, extraBodyList))
  }

  await createDirectory(resolve(weblogRootPath, weblogRouteSource))
  await createDirectory(resolve(weblogRootPath, weblogRouteOutput))

  const fileInfoList = []
  for (const file of fileList) fileInfoList.push(await processFile(outputFile, log, file, weblogRouteSource, weblogRouteOutput))
  __DEV__ && console.log('[fileInfoList]', fileInfoList)

  await outputFile([ weblogRouteIndex ], [
    `<title>${escapeHTML(weblogIndexTitle)}</title>`,
    COMMON_STYLE({ boxReset: false, bodyReset: false }),
    getBodyStyleString({ limitWidth: true })
  ], [
    `<h1>${escapeHTML(weblogIndexTitle)}</h1>`,
    ...fileInfoList
      .sort((a, b) => compareString(b.metaEditFirst, a.metaEditFirst) || compareString(b.metaTitle, a.metaTitle))
      .map((v) => v.indexTagHTMLString),
    `<h6>${new Date().toISOString()}</h6>`,
    biggerTextButtonBodyString
  ])
  log && log(`output: ${weblogRouteIndex}`)

  __DEV__ && console.log('[outputFileList]', outputFileList)
  for (const file of outputFileList) await compressGzBrFileAsync(file, `${file}.gz`)
  log && log(`compress: ${outputFileList.length} file`)

  return {
    fileList
  }
}

export { generateWeblogFromPath }
