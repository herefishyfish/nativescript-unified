import fm from 'front-matter';
import { Lexer, type Token, type TokensList } from 'marked';
import type { DocMeta } from './doc';

/** Build-time only. Imports marked and front-matter, so keep it out of client bundles: it is not exported from the package index. */

export interface ParsedDoc extends DocMeta {
  /** marked lexer output for the body, without front matter. */
  tokens: TokensList;
}
/**
 * A docs page is a run of Markdown tokens or a live demo.
 * A fenced code block whose info string is `html live` is a demo: the code is both shown and rendered.
 * Platform neutral: web renders demos with the web-polyfills, native can render the same tokens.
 */
export type DocBlock = { kind: 'markdown'; tokens: TokensList } | { kind: 'demo'; code: string };

interface FrontMatter {
  title?: string;
  section?: string;
  order?: number;
  description?: string;
}

/** `filename` is any path; the slug is its base name without `.md`. */
export function parseDoc(filename: string, raw: string): ParsedDoc {
  const slug = (filename.split(/[\\/]/).pop() ?? filename).replace(/\.md$/, '');
  const parsed = fm<FrontMatter>(raw);
  const attrs = parsed.attributes;
  return {
    slug,
    title: attrs.title ?? slug,
    section: attrs.section ?? 'Docs',
    order: typeof attrs.order === 'number' ? attrs.order : 1000,
    description: attrs.description ?? '',
    tokens: new Lexer().lex(parsed.body),
  };
}

export function isDemoToken(token: Token): boolean {
  return token.type === 'code' && /^html\s+live\b/.test((token as { lang?: string }).lang ?? '');
}

export function toBlocks(tokens: TokensList): DocBlock[] {
  const blocks: DocBlock[] = [];
  let run: Token[] = [];
  const flush = () => {
    if (run.length > 0) blocks.push({ kind: 'markdown', tokens: Object.assign([...run], { links: tokens.links }) as TokensList });
    run = [];
  };
  for (const token of tokens) {
    if (isDemoToken(token)) {
      flush();
      blocks.push({ kind: 'demo', code: (token as { text: string }).text });
    } else {
      run.push(token);
    }
  }
  flush();
  return blocks;
}