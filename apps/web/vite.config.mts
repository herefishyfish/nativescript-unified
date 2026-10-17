import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  root: import.meta.dirname,
  publicDir: 'src/public',
  build: { outDir: '../../dist/apps/web/client', reportCompressedSize: true, target: ['es2020'] },
  resolve: { mainFields: ['module'], tsconfigPaths: true },
  plugins: [
    analog({ ssr: false, nitro: { preset: 'static' } }),
    tailwindcss(),
  ],
  server: { fs: { allow: ['../..'] } },
  define: { 'import.meta.vitest': mode !== 'production' },
}));
