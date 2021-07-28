import { getRandomId } from '@dr-js/core/module/common/math/random.js'

import Marked from 'marked'

import { registerLanguage, highlight } from 'highlight.js/lib/core.js'
import bash from 'highlight.js/lib/languages/bash.js'
import css from 'highlight.js/lib/languages/css.js'
import diff from 'highlight.js/lib/languages/diff.js'
import javascript from 'highlight.js/lib/languages/javascript.js'
import json from 'highlight.js/lib/languages/json.js'
import lisp from 'highlight.js/lib/languages/lisp.js'
import markdown from 'highlight.js/lib/languages/markdown.js'
import nginx from 'highlight.js/lib/languages/nginx.js'
import plaintext from 'highlight.js/lib/languages/plaintext.js'

const HIGHLIGHT_LANGUAGE_MAP = {
  bash, shell: bash, // for now "shell script" will match just "shell"
  css,
  diff,
  javascript, js: javascript,
  json,
  lisp,
  markdown,
  nginx,
  plaintext
}
const HIGHLIGHT_LANGUAGE_SET = new Set(Object.keys(HIGHLIGHT_LANGUAGE_MAP))
const HIGHLIGHT_LANGUAGE_DEFAULT = 'plaintext'

// https://github.com/highlightjs/highlight.js#nodejs
Object.entries(HIGHLIGHT_LANGUAGE_MAP).forEach(([ languageName, func ]) => registerLanguage(languageName, func))
const highlightMarkdownToHTML = (markdownString) => {
  // NOTE: swap ```js ... ``` to @TAG@js-HASH-HASH@TAG@ and highlight separately, then swap back
  const subHighlightMap = { /* '@TAG@js-HASH-HASH@TAG@': { tag: '@TAG@js-HASH-HASH@TAG@', languageName: 'js', markdownString, HTMLString } */ }
  const tagMarkdownString = markdownString.replace(/```([\w ]+)?([\s\S]+?)```/g, (match, $1 = '', $2 = '') => {
    const languageName = $1.split(/\s/)[ 0 ].trim()
    if (!HIGHLIGHT_LANGUAGE_SET.has(languageName)) return match // skip
    const markdownString = $2
    const HTMLString = `\`\`\`${$1}${highlight(languageName, markdownString).value}\`\`\``
    const tag = `@TAG@${languageName}-${getRandomId()}@TAG@`
    subHighlightMap[ tag ] = { tag, languageName, markdownString, HTMLString }
    return tag
  })
  return highlight('markdown', tagMarkdownString).value
    .replace(/@TAG@[\w-]+?@TAG@/g, (tag) => subHighlightMap[ tag ].HTMLString)
}

// preview to choose: https://highlightjs.org/static/demo/
// edit from: node_modules/highlight.js/styles/atom-one-light.css & node_modules/highlight.js/styles/atom-one-dark.css
const highlightStyleString = `<style> /* highlight.js - Atom One Light/Dark */
/*:root { --hlb1: #fafafa; --hlm1: #383a42; --hlm3: #a0a1a7; --hlh1: #0184bb; --hlh2: #4078f2; --hlh3: #a626a4; --hlh4: #50a14f; --hlh5: #e45649; --hlh6: #986801; --hlb62: #c18401; }*/
/*@media (prefers-color-scheme: dark) {*/
/*  :root { --hlb1: #282c34; --hlm1: #abb2bf; --hlm3: #5c6370; --hlh1: #56b6c2; --hlh2: #61aeee; --hlh3: #c678dd; --hlh4: #98c379; --hlh5: #e06c75; --hlh6: #d19a66; --hlb62: #e6c07b; }*/
/*}*/
:root { --hlb1: #fff; --hlm1: #334; --hlm3: #e5f; --hlh1: #08b; --hlh2: #47f; --hlh3: #a2a; --hlh4: #5a4; --hlh5: #e54; --hlh6: #960; --hlb62: #c80; }
@media (prefers-color-scheme: dark) {
  :root { --hlb1: #223; --hlm1: #abb; --hlm3: #958; --hlh1: #5bc; --hlh2: #6ae; --hlh3: #c7d; --hlh4: #9c7; --hlh5: #e67; --hlh6: #d96; --hlb62: #ec7; }
}
.hljs { display: block; overflow-x: auto; padding: .5em; color: var(--hlm1); background: var(--hlb1); }
.hljs-comment, .hljs-quote { color: var(--hlm3); font-style: italic; }
.hljs-doctag, .hljs-formula, .hljs-keyword { color: var(--hlh3); }
.hljs-deletion, .hljs-name, .hljs-section, .hljs-selector-tag, .hljs-subst { color: var(--hlh5); }
.hljs-literal { color: var(--hlh1); }
.hljs-addition, .hljs-attribute, .hljs-meta-string, .hljs-regexp, .hljs-string { color: var(--hlh4); }
.hljs-built_in, .hljs-class .hljs-title { color: var(--hlb62); }
.hljs-attr, .hljs-number, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-pseudo, .hljs-template-variable, .hljs-type, .hljs-variable { color: var(--hlh6); }
.hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-symbol, .hljs-title { color: var(--hlh2); }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: 700; }
.hljs-link { text-decoration: underline; }
</style>`

// https://marked.js.org/#/USING_ADVANCED.md#alternative-using-reference
Marked.setOptions({
  highlight: (code, languageName) => highlight(
    HIGHLIGHT_LANGUAGE_SET.has(languageName) ? languageName : HIGHLIGHT_LANGUAGE_DEFAULT,
    code
  ).value,
  langPrefix: 'hljs ' // TODO: HACK: add CSS className hljs to <code>
})

export {
  highlightMarkdownToHTML, highlightStyleString,
  Marked
}
