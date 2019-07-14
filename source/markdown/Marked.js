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
  bash,
  css,
  diff,
  javascript,
  js: javascript,
  json,
  lisp,
  nginx,
  plaintext
}
const HIGHLIGHT_LANGUAGE_SET = new Set(Object.keys(HIGHLIGHT_LANGUAGE_MAP))
const HIGHLIGHT_LANGUAGE_DEFAULT = 'plaintext'

Object.entries(HIGHLIGHT_LANGUAGE_MAP).forEach(([ lang, func ]) => registerLanguage(lang, func))
Marked.setOptions({ highlight: (code, lang) => highlight(HIGHLIGHT_LANGUAGE_SET.has(lang) ? lang : HIGHLIGHT_LANGUAGE_DEFAULT, code).value })

const highlightStyleString = `<style> /* highlight.js - Atom One Dark */
.hljs { display: block;overflow-x: auto;padding: .5em;color: #abb2bf;background: #282c34; }
.hljs-comment, .hljs-quote { color: #5c6370;font-style: italic; }
.hljs-doctag, .hljs-formula, .hljs-keyword { color: #c678dd; }
.hljs-deletion, .hljs-name, .hljs-section, .hljs-selector-tag, .hljs-subst { color: #e06c75; }
.hljs-literal { color: #56b6c2; }
.hljs-addition, .hljs-attribute, .hljs-meta-string, .hljs-regexp, .hljs-string { color: #98c379; }
.hljs-built_in, .hljs-class .hljs-title { color: #e6c07b; }
.hljs-attr, .hljs-number, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-pseudo, .hljs-template-variable, .hljs-type, .hljs-variable { color: #d19a66; }
.hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-symbol, .hljs-title { color: #61aeee; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: 700; }
.hljs-link { text-decoration: underline; }
</style>`

export { Marked, highlightStyleString }
