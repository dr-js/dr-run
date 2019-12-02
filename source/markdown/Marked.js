import Marked from 'marked'

import { registerLanguage, highlight } from 'highlight.js/lib/highlight'

import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import lisp from 'highlight.js/lib/languages/lisp'
import nginx from 'highlight.js/lib/languages/nginx'
import plaintext from 'highlight.js/lib/languages/plaintext'

const HIGHLIGHT_LANGUAGE_MAP = {
  bash, shell: bash,
  css,
  diff,
  javascript, js: javascript,
  json,
  lisp,
  nginx,
  plaintext
}
const HIGHLIGHT_LANGUAGE_SET = new Set(Object.keys(HIGHLIGHT_LANGUAGE_MAP))
const HIGHLIGHT_LANGUAGE_DEFAULT = 'plaintext'

Object.entries(HIGHLIGHT_LANGUAGE_MAP).forEach(([ lang, func ]) => registerLanguage(lang, func))
Marked.setOptions({ highlight: (code, lang) => highlight(HIGHLIGHT_LANGUAGE_SET.has(lang) ? lang : HIGHLIGHT_LANGUAGE_DEFAULT, code).value })

// edit from: node_modules/highlight.js/styles/atom-one-light.css & node_modules/highlight.js/styles/atom-one-dark.css
const highlightStyleString = `<style>
/* highlight.js - Atom One Light/Dark */
:root { --hlb1:#fafafa; --hlm1:#383a42; --hlm3:#a0a1a7; --hlh1:#0184bb; --hlh2:#4078f2; --hlh3:#a626a4; --hlh4:#50a14f; --hlh5:#e45649; --hlh6:#986801; --hlb62:#c18401; }
@media (prefers-color-scheme: dark) { :root { --hlb1:#282c34; --hlm1:#abb2bf; --hlm3:#5c6370; --hlh1:#56b6c2; --hlh2:#61aeee; --hlh3:#c678dd; --hlh4:#98c379; --hlh5:#e06c75; --hlh6:#d19a66; --hlb62:#e6c07b; } }
.hljs {display:block;overflow-x:auto;padding:.5em;color:var(--hlm1);background:var(--hlb1)}
.hljs-comment,.hljs-quote {color:var(--hlm3);font-style:italic}
.hljs-doctag,.hljs-formula,.hljs-keyword {color:var(--hlh3)}
.hljs-deletion,.hljs-name,.hljs-section,.hljs-selector-tag,.hljs-subst {color:var(--hlh5)}
.hljs-literal {color:var(--hlh1)}
.hljs-addition,.hljs-attribute,.hljs-meta-string,.hljs-regexp,.hljs-string {color:var(--hlh4)}
.hljs-built_in,.hljs-class .hljs-title {color:var(--hlb62)}
.hljs-attr,.hljs-number,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-pseudo,.hljs-template-variable,.hljs-type,.hljs-variable {color:var(--hlh6)}
.hljs-bullet,.hljs-link,.hljs-meta,.hljs-selector-id,.hljs-symbol,.hljs-title {color:var(--hlh2)}
.hljs-emphasis {font-style:italic}
.hljs-strong {font-weight:700}
.hljs-link {text-decoration:underline}
</style>`

export { Marked, highlightStyleString }
