import { resolve } from 'path'
import { createDirectory, deleteDirectory } from '@dr-js/core/module/node/file/Directory'
import { copyPath } from '@dr-js/core/module/node/file/Path'
import { resetDirectory } from '@dr-js/dev/module/node/file'

import { generateWeblogFromPath } from './generate'

const { describe, it, before, after, info = console.log } = global

const TEST_FILE_NAME = 'generate.test.md'

const TEST_ROOT = resolve(__dirname, 'generate-gitignore/')
const fromRoot = (...args) => resolve(TEST_ROOT, ...args)

before('prepare', async () => {
  await resetDirectory(TEST_ROOT)
})
after('clear', async () => {
  await deleteDirectory(TEST_ROOT)
})

describe('Weblog.Module.Generate', () => {
  it('generateWeblogFromPath()', async () => {
    await createDirectory(fromRoot(TEST_ROOT, 't'))
    await copyPath(resolve(__dirname, TEST_FILE_NAME), fromRoot(TEST_ROOT, 't/', TEST_FILE_NAME))
    await generateWeblogFromPath({
      log: (...args) => info('--', ...args),
      weblogRootPath: TEST_ROOT,
      weblogRouteIndex: 'index.html',
      weblogRouteRoot: 't/',
      weblogIndexTitle: 'Dr.Weblog <TEST>'
    })
    info('done')
  })
})
