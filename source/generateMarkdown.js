import Marked from 'marked'

import { registerLanguage, highlightAuto } from 'highlight.js/lib/highlight'

import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import markdown from 'highlight.js/lib/languages/markdown'
import diff from 'highlight.js/lib/languages/diff'
import dos from 'highlight.js/lib/languages/dos'
import http from 'highlight.js/lib/languages/http'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import nginx from 'highlight.js/lib/languages/nginx'
import plaintext from 'highlight.js/lib/languages/plaintext'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import yaml from 'highlight.js/lib/languages/yaml'

registerLanguage('bash', bash)
registerLanguage('css', css)
registerLanguage('markdown', markdown)
registerLanguage('diff', diff)
registerLanguage('dos', dos)
registerLanguage('http', http)
registerLanguage('javascript', javascript)
registerLanguage('json', json)
registerLanguage('nginx', nginx)
registerLanguage('plaintext', plaintext)
registerLanguage('shell', shell)
registerLanguage('sql', sql)
registerLanguage('yaml', yaml)

Marked.setOptions({ highlight: (code) => highlightAuto(code).value })

const highlightStyleString = `<style>
.hljs { display: block; overflow-x: auto; padding: 0.5em; color: #333; background: #f8f8f8; }
.hljs-comment,
.hljs-quote { color: #998; font-style: italic; }
.hljs-keyword,
.hljs-selector-tag,
.hljs-subst { color: #333; font-weight: bold; }
.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable,
.hljs-tag .hljs-attr { color: #008080; }
.hljs-string,
.hljs-doctag { color: #d14; }
.hljs-title,
.hljs-section,
.hljs-selector-id { color: #900; font-weight: bold; }
.hljs-subst { font-weight: normal; }
.hljs-type,
.hljs-class .hljs-title { color: #458; font-weight: bold; }
.hljs-tag,
.hljs-name,
.hljs-attribute { color: #000080; font-weight: normal; }
.hljs-regexp,
.hljs-link { color: #009926; }
.hljs-symbol,
.hljs-bullet { color: #990073; }
.hljs-built_in,
.hljs-builtin-name { color: #0086b3; }
.hljs-meta { color: #999; font-weight: bold; }
.hljs-deletion { background: #fdd; }
.hljs-addition { background: #dfd; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }
</style>`

export { Marked, highlightStyleString }
