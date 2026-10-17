import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { parseDoc, toBlocks } from '../../../packages/shared/src/lib/docs/parse.ts';
import { codeBlock, renderTokens } from './markdown.ts';

const VIRTUAL = '~docs';
const RESOLVED = '\0' + VIRTUAL;

/**
 * Parses docs Markdown and front matter at build time.
 * `~docs` exports the finished pages (HTML strings plus demo sources), so marked, front-matter and prismjs never reach the client bundle.
 */
export function docsPlugin(contentDir: string): Plugin {
  const build = () => {
    const docs = readdirSync(contentDir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => {
        const { tokens, ...meta } = parseDoc(file, readFileSync(resolve(contentDir, file), 'utf8'));
        const blocks = toBlocks(tokens).map((block) =>
          block.kind === 'demo'
            ? { kind: 'demo' as const, code: block.code, html: codeBlock(block.code, 'html') }
            : { kind: 'html' as const, html: renderTokens(block.tokens) },
        );
        return { ...meta, blocks };
      });
    return `export const DOCS = ${JSON.stringify(docs)};`;
  };
  return {
    name: 'docs-markdown',
    enforce: 'pre',
    // Bundle the module into the SSR build instead of leaving a bare import for Node to resolve.
    config: () => ({ ssr: { noExternal: [VIRTUAL] } }),
    resolveId: (id) => (id === VIRTUAL ? RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED) return undefined;
      for (const file of readdirSync(contentDir)) if (file.endsWith('.md')) this.addWatchFile(resolve(contentDir, file));
      return build();
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(contentDir) || !file.endsWith('.md')) return;
      const mod = server.moduleGraph.getModuleById(RESOLVED);
      if (mod) server.moduleGraph.invalidateModule(mod);
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
