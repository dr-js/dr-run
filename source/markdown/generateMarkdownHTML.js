import { resolve, join, dirname, basename, extname } from 'path'

import { compareString } from 'dr-js/module/common/compare'
import { COMMON_LAYOUT } from 'dr-js/module/node/server/commonHTML'
import { readFileAsync, writeFileAsync } from 'dr-js/module/node/file/function'
import { PATH_TYPE, toPosixPath } from 'dr-js/module/node/file/Path'
import { getDirectorySubInfoList } from 'dr-js/module/node/file/Directory'

import { getMarkdownHeaderLink } from 'dr-dev/module/node/export/renderMarkdown'

import { Marked, highlightStyleString } from './Marked'

const joinText = (...args) => args.filter(Boolean).join('\n')
const trimTitle = (string) => string.replace(/[^\w ()`/-]/g, '').trim()

const REGEXP_DATE = /\d\d\d\d\/\d\d\/\d\d/ // lock date format to YYYY/MM/DD

const themeColorMetaString = `<meta name="theme-color" content="#000">`

const markdownStyleString = `<style>
* { scrollbar-color: #888a #6664; scrollbar-width: thin; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: #8886; }
::-webkit-scrollbar-thumb:hover { background: #888a; }
@media (pointer: fine) { ::-webkit-scrollbar { width: 14px; height: 14px; } }
@media (pointer: coarse) { ::-webkit-scrollbar { width: 6px; height: 6px; } }

body { margin: 0 auto; padding: 0 8px; max-width: 800px;  word-break: break-word; font-family: sans-serif; }
a { color: #63aeff; }
ul { padding-inline-start: 1em; list-style: circle; }
pre { overflow: auto; border: 1px solid #888; font-family: monospace; }
blockquote { border-left: 0.5em solid #888; }

/* dark theme */
html { color: #fff; background: #000; }
p { color: #ddd; }
b { color: #fff; }
</style>`

const generateMarkdown = async (file) => {
  __DEV__ && console.log('[generateMarkdown]', file)
  const markdownString = String(await readFileAsync(file))

  const tokenData = Marked.lexer(markdownString)
  const metaTitle = trimTitle(tokenData.links[ 'meta:title' ].title)
  const metaEditLogList = tokenData.links[ 'meta:edit-log' ].title.split(',').map((v) => v.trim())

  if (!metaTitle) throw new Error(`[generateMarkdown] expect meta link: [meta:title]: # "Title here"`)
  if (!metaEditLogList.every((v) => REGEXP_DATE.test(v))) throw new Error(`[generateMarkdown] expect meta link: [meta:edit-log]: # "yyyy/mm/dd"`)

  const metaEditFirst = metaEditLogList[ 0 ]
  const metaEditLogCount = metaEditLogList.length
  const metaEditLogString = `${metaEditFirst}${metaEditLogCount >= 2 ? ` (${metaEditLogList[ metaEditLogCount - 1 ]}, #${metaEditLogCount})` : ''}`

  const headerTokenList = tokenData.filter((v) => v.type === 'heading') // # some title // {type:"heading", depth:"1", text:"some title"}
  const headerDepthMap = [ ...new Set(headerTokenList.map((v) => v.depth)) ].sort().reduce((o, v, i) => {
    o[ v ] = i + 1
    return o
  }, {})
  const headerLink = headerTokenList.map(v => `${'* '.repeat(headerDepthMap[ v.depth ])}${getMarkdownHeaderLink(v.text)}`).join('\n')

  const markdownFileName = `${basename(file, extname(file))}.html` // `${basename(file, extname(file))}-${generateHash(markdownString)}.html`
  const markdownHTMLString = COMMON_LAYOUT([
    `<title>${metaTitle}</title>`,
    themeColorMetaString,
    markdownStyleString,
    tokenData.find(({ type }) => type === 'code') ? highlightStyleString : '' // ```js\n``` // {type:"code", lang:"js", text:""}
  ], [
    Marked(`# ${metaTitle}`),
    Marked(`###### ${metaEditLogString}`),
    Marked(headerLink),
    Marked.parser(Object.assign(tokenData, { links: tokenData.links }))
  ])

  const indexTagString = joinText(
    `<p>`,
    `<a href="${encodeURI(toPosixPath(join('t', basename(file))))}" title="get source markdown">📄</a>`,
    `<a href="${encodeURI(toPosixPath(join('t', markdownFileName)))}">${metaTitle}</a>`,
    `[${metaEditLogString}]`,
    `</p>`
  )

  return {
    markdownFileName,
    markdownHTMLString,
    indexTagString,
    metaEditFirst
  }
}

const generateMarkdownHTML = async (rootPath) => {
  __DEV__ && console.log('[generateMarkdownHTML]', rootPath)

  const fileList = (await getDirectorySubInfoList(resolve(rootPath, 'file/[PUBLIC]/t/')))
    .map(({ path, name, type }) => type === PATH_TYPE.File && name.endsWith('.md') && path)
    .filter(Boolean)

  const indexTagList = []
  for (const file of fileList) {
    const {
      markdownFileName,
      markdownHTMLString,
      indexTagString,
      metaEditFirst
    } = await generateMarkdown(file)

    console.log('file:', markdownFileName)
    await writeFileAsync(join(dirname(file), markdownFileName), markdownHTMLString)

    indexTagList.push({ indexTagString, metaEditFirst })
  }

  console.log('file: index.html')
  await writeFileAsync(
    resolve(rootPath, 'file/[PUBLIC]/index.html'),
    COMMON_LAYOUT([
      `<title>Dr.Weblog</title>`,
      themeColorMetaString,
      markdownStyleString
    ], [
      `<h1>Dr.Weblog</h1>`,
      ...indexTagList
        .sort((a, b) => compareString(b.metaEditFirst, a.metaEditFirst))
        .map((v) => v.indexTagString),
      `<h6>${new Date().toISOString()}</h6>`
    ])
  )
}

export { generateMarkdownHTML }
