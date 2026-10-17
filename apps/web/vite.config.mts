import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(({ mode }) => ({
  root: import.meta.dirname,
  publicDir: 'src/public',
  build: { outDir: '../../dist/apps/web/client', reportCompressedSize: true, emptyOutDir: true, target: ['es2020'] },
  resolve: { mainFields: ['module'] },
  plugins: [
    analog({
      ssr: false,
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
