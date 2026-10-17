import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { docsPlugin } from './tools/docs-plugin.ts';

/** Every Markdown file in packages/shared/content/docs becomes a prerendered /docs/:slug route. */
const contentDir = resolve(import.meta.dirname, '../../packages/shared/content/docs');
const docSlugs = readdirSync(contentDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''));

export default defineConfig(({ mode }) => ({
  root: import.meta.dirname,
  publicDir: 'src/public',
  build: { outDir: '../../dist/apps/web/client', reportCompressedSize: true, emptyOutDir: true, target: ['es2020'] },
  resolve: { mainFields: ['module'] },
  plugins: [
    docsPlugin(contentDir),
    analog({
      ssr: true,
      static: true,
      prerender: {
        routes: ['/', '/404', ...docSlugs.map((slug) => `/docs/${slug}`)],
        // Static hosts serve /404.html for unknown URLs. The catch-all route is prerendered at /404, so copy it there.
        postRenderingHooks: [
          async (page) => {
            if (page.route !== '/404' || !page.contents) return;
            const out = resolve(import.meta.dirname, '../../dist/apps/web/analog/public/404.html');
            mkdirSync(dirname(out), { recursive: true });
            writeFileSync(out, page.contents);
          },
        ],
      },
      nitro: { preset: 'static' },
      workspaceRoot: resolve(import.meta.dirname, '../..'),
      vite: { tsconfig: resolve(import.meta.dirname, 'tsconfig.app.json') },
    }),
    nxViteTsPaths(),
    tailwindcss(),
  ],
  server: { fs: { allow: ['../..'] } },
  define: { 'import.meta.vitest': mode !== 'production' },
}));


