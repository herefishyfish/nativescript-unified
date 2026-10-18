import { Marked, type TokensList } from 'marked';
import Prism from 'prismjs';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Prism core ships markup, css, clike and javascript. Anything else renders as plain text. */
export function highlight(code: string, info: string | undefined): string {
  const lang = (info ?? '').split(/\s+/)[0];
  const grammar = lang === 'html' ? Prism.languages['markup'] : lang === 'css' ? Prism.languages['css'] : lang === 'ts' || lang === 'js' ? Prism.languages['javascript'] : undefined;
  return grammar ? Prism.highlight(code, grammar, lang) : escapeHtml(code);
}

export function codeBlock(code: string, info: string | undefined): string {
  const lang = (info ?? '').split(/\s+/)[0] || 'text';
  return `<div class="docs-code-wrap"><button type="button" class="docs-copy" data-copy aria-label="Copy code">Copy</button><pre class="docs-code" tabindex="0" data-lang="${escapeHtml(lang)}"><code>${highlight(code.replace(/\n$/, ''), info)}</code></pre></div>`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** GitHub-style alerts: a blockquote starting with [!NOTE], [!TIP] or [!WARNING] becomes a callout. */
const CALLOUTS: Record<string, string> = { NOTE: 'note', TIP: 'tip', WARNING: 'warning', IMPORTANT: 'warning', CAUTION: 'warning' };

const marked = new Marked({
  renderer: {
    heading({ tokens, depth, text }) {
      return `<h${depth} id="${slugify(text)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
    },
    code({ text, lang }) {
      return codeBlock(text, lang);
    },
    blockquote({ tokens }) {
      const inner = this.parser.parse(tokens);
      const m = /^<p>\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\][ \t]*(?:<br>)?\s*/i.exec(inner);
      if (!m) return `<blockquote>\n${inner}</blockquote>\n`;
      const kind = CALLOUTS[m[1].toUpperCase()];
      const body = inner.slice(m[0].length).replace(/^(<\/p>\s*)/, '').replace(/^(?!<)/, '<p>');
      return `<aside class="docs-callout docs-callout-${kind}" role="note"><p class="docs-callout-title">${kind[0].toUpperCase()}${kind.slice(1)}</p>${body}</aside>\n`;
    },
    table(token) {
      const head = token.header.map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`).join('');
      const rows = token.rows.map((row) => `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join('')}</tr>`).join('');
      return `<div class="docs-table"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
    },
  },
});

export function renderTokens(tokens: TokensList): string {
  return marked.parser(tokens);
}