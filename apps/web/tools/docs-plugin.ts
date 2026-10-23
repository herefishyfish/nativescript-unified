import { readdirSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import type { Token } from 'marked';
import type { Plugin } from 'vite';
import { parseDoc, toBlocks } from '../../../packages/shared/src/lib/docs/parse.ts';
import { codeBlock, highlight, renderTokens, slugify } from './markdown.ts';

const HIGHLIGHT = '?highlight';

/**
 * `import snippet from './card.html?highlight'` gives `{ code, html }`: the file's text and its Prism markup, built at build time.
 * A component can use the same file as its templateUrl, so the code shown beside a preview is the code that renders it.
 */
export function highlightPlugin(): Plugin {
  return {
    name: 'highlight-source',
    enforce: 'pre',
    load(id) {
      if (!id.endsWith(HIGHLIGHT)) return undefined;
      const file = id.slice(0, -HIGHLIGHT.length);
      this.addWatchFile(file);
      const code = readFileSync(file, 'utf8').replace(/\n$/, '');
      return `export default ${JSON.stringify({ code, html: highlight(code, extname(file).slice(1)) })};`;
    },
  };
}

const VIRTUAL = '~docs';
const RESOLVED = '\0' + VIRTUAL;
const SEARCH = 'virtual:docs-search';
const SEARCH_RESOLVED = '\0' + SEARCH;

const plain = (text: string) =>
  text.replace(/<[^>]+>/g, ' ').replace(/[`*_#>|]|\[([^\]]*)\]\([^)]*\)/g, '$1 ').replace(/\s+/g, ' ').trim();

interface SearchEntry { slug: string; title: string; section: string; heading: string; id: string; text: string }
type Heading = { type: 'heading'; depth: number; text: string };
const isHeading = (token: Token): token is Token & Heading => token.type === 'heading';

/** One entry per page intro and per h2/h3 section, derived from the same tokens the pages render from. */
function searchEntries(meta: { slug: string; title: string; section: string; description: string }, tokens: Token[]): SearchEntry[] {
  const out: SearchEntry[] = [];
  const base = { slug: meta.slug, title: meta.title, section: meta.section };
  let current = { heading: '', id: '', body: [meta.description] };
  const push = () => {
    const text = plain(current.body.join(' '));
    if (text || current.heading) out.push({ ...base, heading: current.heading, id: current.id, text });
  };
  for (const token of tokens) {
    if (isHeading(token) && (token.depth === 2 || token.depth === 3)) {
      push();
      current = { heading: plain(token.text), id: slugify(token.text), body: [] };
    } else if (isHeading(token) && token.depth === 1) {
      continue;
    } else {
      current.body.push(token.type === 'code' ? (token as { text: string }).text : token.raw);
    }
  }
  push();
  return out;
}

/**
 * Parses docs Markdown and front matter at build time.
 * `~docs` exports the finished pages (HTML strings, demo sources, h2/h3 headings), so marked, front-matter and prismjs never reach the client bundle.
 * `virtual:docs-search` exports the search index, built from the same parse.
 */
export function docsPlugin(contentDir: string): Plugin {
  const parseAll = () =>
    readdirSync(contentDir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => {
        const { tokens, ...meta } = parseDoc(file, readFileSync(resolve(contentDir, file), 'utf8'));
        const headings = tokens.filter(isHeading).filter((t) => t.depth === 2 || t.depth === 3).map((t) => ({ id: slugify(t.text), text: t.text, depth: t.depth as 2 | 3 }));
        const blocks = toBlocks(tokens).map((block) =>
          block.kind === 'demo'
            ? { kind: 'demo' as const, code: block.code, html: codeBlock(block.code, 'html') }
            : { kind: 'html' as const, html: renderTokens(block.tokens) },
        );
        return { doc: { ...meta, headings, blocks }, search: searchEntries(meta, tokens) };
      });
  return {
    name: 'docs-markdown',
    enforce: 'pre',
    // Bundle the module into the SSR build instead of leaving a bare import for Node to resolve.
    config: () => ({ ssr: { noExternal: [VIRTUAL, SEARCH] } }),
    resolveId: (id) => (id === VIRTUAL ? RESOLVED : id === SEARCH ? SEARCH_RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED && id !== SEARCH_RESOLVED) return undefined;
      for (const file of readdirSync(contentDir)) if (file.endsWith('.md')) this.addWatchFile(resolve(contentDir, file));
      const all = parseAll();
      return id === RESOLVED
        ? `export const DOCS = ${JSON.stringify(all.map((d) => d.doc))};`
        : `export default ${JSON.stringify(all.flatMap((d) => d.search))};`;
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(contentDir) || !file.endsWith('.md')) return;
      for (const id of [RESOLVED, SEARCH_RESOLVED]) {
        const mod = server.moduleGraph.getModuleById(id);
        if (mod) server.moduleGraph.invalidateModule(mod);
      }
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
