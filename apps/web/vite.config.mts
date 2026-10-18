import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { docsPlugin } from './tools/docs-plugin.ts';

const docsDir = resolve(import.meta.dirname, '../../packages/shared/content/docs');

/** Every Markdown file in packages/shared/content/docs becomes a prerendered /docs/:slug route. */
const docSlugs = readdirSync(docsDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''));

const siteUrl = (process.env.VITE_SITE_URL || 'https://nativescript-unified.example').replace(/\/+$/, '');

/** sitemap.xml and robots.txt for the prerendered public folder. */
function writeSeoFiles(routes: string[]): void {
  const dir = resolve(import.meta.dirname, '../../dist/apps/web/analog/public');
  mkdirSync(dir, { recursive: true });
  const urls = routes.map((r) => `  <url><loc>${siteUrl}${r}</loc></url>`);
  writeFileSync(resolve(dir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  writeFileSync(resolve(dir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
}

export default defineConfig(({ mode }) => ({
  root: import.meta.dirname,
  publicDir: 'src/public',
  build: { outDir: '../../dist/apps/web/client', reportCompressedSize: true, emptyOutDir: true, target: ['es2020'] },
  resolve: { mainFields: ['module'] },
  plugins: [
    docsPlugin(docsDir),
    analog({
      ssr: true,
      static: true,
      prerender: {
        routes: ['/', '/404', ...docSlugs.map((slug) => `/docs/${slug}`)],
        // Static hosts serve /404.html for unknown URLs. The catch-all route is prerendered at /404, so copy it there.
        postRenderingHooks: [
          async (page) => {
            if (page.route !== '/404' || !page.contents) return;
            writeSeoFiles(['/', ...docSlugs.map((slug) => `/docs/${slug}`)]);
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


