import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { collectSourceRouteMap } from '@dr-js/dev/module/node/export/parse'
import { generateExportInfo } from '@dr-js/dev/module/node/export/generate'
import { getMarkdownFileLink, renderMarkdownAutoAppendHeaderLink, renderMarkdownBlockQuote, renderMarkdownExportPath } from '@dr-js/dev/module/node/export/renderMarkdown'
import { runMain } from '@dr-js/dev/module/main'

import { formatUsage } from 'source/option'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

runMain(async (logger) => {
  logger.log(`generate exportInfoMap`)
  const sourceRouteMap = await collectSourceRouteMap({ pathRootList: [ fromRoot('source') ], logger })
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: SPEC.md`)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...renderMarkdownAutoAppendHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
      '',
      '#### Bin Option Format',
      getMarkdownFileLink('source/option.js'),
      ...renderMarkdownBlockQuote(formatUsage())
    ),
    ''
  ].join('\n'))
}, 'generate-export')
