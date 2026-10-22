/// <reference path="./prism-core.d.ts" />
// Prism's core alone, not the `prismjs` bundle: the bundle adds the file-highlight plugin. With no
// `window` (NativeScript, Node) the core skips its auto-highlight and never touches `document`.
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

/**
 * A run of code text and the Prism token types it sits in, outermost first, as one class string
 * (`token tag punctuation`). Plain text has no classes. Runs are flat, so a renderer needs no
 * nested elements; listing the outer types too keeps the color a nested `<span>` would inherit.
 */
export interface CodeRun {
  readonly text: string;
  readonly classes: string;
}

/** HTML plus Angular template syntax: `@if`-style blocks and `{{ }}` interpolation. */
Prism.languages['angular-html'] = Prism.languages.extend('markup', {});
Prism.languages.insertBefore('angular-html', 'tag', {
  'control-flow': {
    pattern: /@(?:else\s+if|if|else|for|switch|case|default|empty|defer|placeholder|loading|error|let)\b/,
    alias: 'keyword',
  },
  interpolation: {
    pattern: /\{\{[\s\S]*?\}\}/,
    // Not `punctuation`: `rest` copies TypeScript's keys over this object's, and its own would win.
    inside: { delimiter: { pattern: /^\{\{|\}\}$/, alias: 'punctuation' }, rest: Prism.languages['typescript'] },
  },
});

const GRAMMARS: Record<string, string> = {
  html: 'angular-html',
  angular: 'angular-html',
  xml: 'markup',
  svg: 'markup',
  markup: 'markup',
  ts: 'typescript',
  typescript: 'typescript',
  js: 'javascript',
  javascript: 'javascript',
  mjs: 'javascript',
  css: 'css',
  scss: 'scss',
  json: 'json',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  md: 'markdown',
  markdown: 'markdown',
};

function flatten(stream: Array<string | Prism.Token>, outer: string[], runs: CodeRun[]): void {
  for (const token of stream) {
    if (typeof token === 'string') {
      if (token) runs.push({ text: token, classes: outer.length ? ['token', ...outer].join(' ') : '' });
      continue;
    }
    const aliases = token.alias === undefined ? [] : Array.isArray(token.alias) ? token.alias : [token.alias];
    const types = [...outer, token.type, ...aliases].filter((type, i, all) => all.lastIndexOf(type) === i);
    const content = token.content;
    flatten(typeof content === 'string' ? [content] : Array.isArray(content) ? content : [content], types, runs);
  }
}

/**
 * Splits `code` into Prism token runs for `lang` (a fenced block's info string; only its first word
 * counts). The runs' text joins back to `code` exactly. An unknown language is one plain run.
 */
export function highlightRuns(code: string, lang: string | null | undefined): CodeRun[] {
  const grammar = Prism.languages[GRAMMARS[(lang ?? '').trim().split(/\s+/)[0].toLowerCase()] ?? ''];
  if (!grammar) return code ? [{ text: code, classes: '' }] : [];
  const runs: CodeRun[] = [];
  flatten(Prism.tokenize(code, grammar), [], runs);
  return runs;
}
