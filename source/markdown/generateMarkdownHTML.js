import { resolve, join, dirname, basename, extname } from 'path'

import { compareString } from 'dr-js/module/common/compare'
import { COMMON_LAYOUT } from 'dr-js/module/node/server/commonHTML'
import { readFileAsync, writeFileAsync, toPosixPath } from 'dr-js/module/node/file/function'
import { getFileList } from 'dr-js/module/node/file/Directory'

import { getMarkdownHeaderLink } from 'dr-dev/module/node/export/renderMarkdown'

import { Marked, highlightStyleString } from './Marked'

const joinText = (...args) => args.filter(Boolean).join('\n')
const trimTitle = (string) => string.replace(/[^\w ()`/-]/g, '').trim()

const REGEXP_DATE = /\d\d\d\d\/\d\d\/\d\d/

const markdownStyleString = `<style>
body { 
  margin: 0 auto;
  padding: 0 8px;
  max-width: 640px; 
  word-break: break-word;
  font-family: Segoe UI,Open Sans,Helvetica,Arial,Hiragino Sans GB,Microsoft YaHei,WenQuanYi Micro Hei,sans-serif;
}
a { color: #06d; }
pre, code {
  overflow: auto;
  background: rgba(0, 0, 0, 0.05);
  font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace;
}
pre code { background: none; }
blockquote { border-left: 0.5em solid rgba(0, 0, 0, 0.2); }
</style>`

const generateMarkdown = async (file) => {
  __DEV__ && console.log('[generateMarkdown]', file)
  const markdownString = String(await readFileAsync(file))

  const tokenData = Marked.lexer(markdownString)
  const title = trimTitle(tokenData.links[ 'meta:title' ].title)
  const date = trimTitle(tokenData.links[ 'meta:date' ].title)

  if (!title) throw new Error(`[generateMarkdown] expect meta link: [meta:title]: # "Title here"`)
  if (!REGEXP_DATE.test(date)) throw new Error(`[generateMarkdown] expect meta link: [meta:date]: # "yyyy/mm/dd"`)

  const headerLink = tokenData
    .filter((v) => v.type === 'heading')
    .map(v => `* ${getMarkdownHeaderLink(v.text)}`)
    .join('\n')

  const markdownFileName = `${basename(file, extname(file))}.html` // `${basename(file, extname(file))}-${generateHash(markdownString)}.html`
  const markdownHTMLString = COMMON_LAYOUT([
    `<title>${title}</title>`,
    markdownStyleString,
    tokenData.find(({ type }) => type === 'code') ? highlightStyleString : ''
  ], [
    Marked(`# ${title}`),
    Marked(`###### ${date}`),
    Marked(headerLink),
    Marked.parser(Object.assign(tokenData, { links: tokenData.links }))
  ])

  const indexTagString = joinText(
    `<p>`,
    `<a href="${encodeURI(toPosixPath(join('t', basename(file))))}" title="get source markdown">📄</a>`,
    `<a href="${encodeURI(toPosixPath(join('t', markdownFileName)))}">${title}</a>`,
    `[${date}]`,
    `</p>`
  )

  return {
    markdownFileName,
    markdownHTMLString,
    indexTagString,
    date
  }
}

const generateMarkdownHTML = async (rootPath) => {
  __DEV__ && console.log('[generateMarkdownHTML]', rootPath)

  const fileList = (await getFileList(resolve(rootPath, 'file/[PUBLIC]/t/')))
    .filter((file) => file.endsWith('.md'))

  const indexTagList = []
  for (const file of fileList) {
    const {
      markdownFileName,
      markdownHTMLString,
      indexTagString,
      date
    } = await generateMarkdown(file)

    console.log('file:', markdownFileName)
    await writeFileAsync(join(dirname(file), markdownFileName), markdownHTMLString)

    indexTagList.push({ indexTagString, date })
  }

  console.log('file: index.html')
  await writeFileAsync(
    resolve(rootPath, 'file/[PUBLIC]/index.html'),
    COMMON_LAYOUT([
      `<title>Dr.Weblog</title>`,
      markdownStyleString
    ], [
      `<h1>Dr.Weblog</h1>`,
      ...indexTagList
        .sort((a, b) => compareString(b.date, a.date))
        .map((v) => v.indexTagString),
      `<h6>${new Date().toISOString()}</h6>`
    ])
  )
}

export { generateMarkdownHTML }
