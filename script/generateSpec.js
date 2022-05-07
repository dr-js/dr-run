import { runKit } from '@dr-js/core/module/node/kit.js'
import { writeTextSync } from '@dr-js/core/module/node/fs/File.js'

import { collectSourceJsRouteMap } from '@dr-js/dev/module/node/export/parsePreset.js'
import { generateExportInfo } from '@dr-js/dev/module/node/export/generate.js'
import { getMarkdownFileLink, renderMarkdownBlockQuote, renderMarkdownAutoAppendHeaderLink, renderMarkdownExportPath } from '@dr-js/dev/module/node/export/renderMarkdown.js'

import { formatUsage } from 'source/option.js'

runKit(async (kit) => {
  kit.padLog('generate exportInfoMap')
  const sourceRouteMap = await collectSourceJsRouteMap({ pathRootList: [ kit.fromRoot('source') ], kit })
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  kit.padLog('output: SPEC.md')
  writeTextSync(kit.fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...renderMarkdownAutoAppendHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: kit.fromRoot() }),
      '',
      '#### Bin Option Format',
      getMarkdownFileLink('source/option.js'),
      ...renderMarkdownBlockQuote(formatUsage())
    ),
    ''
  ].join('\n'))
}, 'generate-spec')
