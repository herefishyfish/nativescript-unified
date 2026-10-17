import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import { docsSearchIndex } from '../../tools/docs-search-index.mjs';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

const docsDir = resolve(import.meta.dirname, '../../packages/shared/content/docs');

/** Every Markdown file in packages/shared/content/docs becomes a prerendered /docs/:slug route. */
const docSlugs = readdirSync(docsDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''));

export default defineConfig(({ mode }) => ({
  root: import.meta.dirname,
  publicDir: 'src/public',
  build: { outDir: '../../dist/apps/web/client', reportCompressedSize: true, emptyOutDir: true, target: ['es2020'] },
  resolve: { mainFields: ['module'] },
  plugins: [
    analog({
      ssr: true,
      static: true,
      prerender: { routes: ['/', ...docSlugs.map((slug) => `/docs/${slug}`)] },
      nitro: { preset: 'static' },
      workspaceRoot: resolve(import.meta.dirname, '../..'),
      vite: { tsconfig: resolve(import.meta.dirname, 'tsconfig.app.json') },
    }),
    docsSearchIndex(docsDir),
    nxViteTsPaths(),
    tailwindcss(),
  ],
  server: { fs: { allow: ['../..'] } },
  define: { 'import.meta.vitest': mode !== 'production' },
}));


