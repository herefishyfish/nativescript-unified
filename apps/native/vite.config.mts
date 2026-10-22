import { angularConfig } from '@nativescript/vite/angular';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { defineConfig, mergeConfig, normalizePath, type UserConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// Imported from source so plugin edits apply without rebuilding the package.
import { nativescriptAnalog } from '../../packages/analog-native/vite/src/index.ts';

const require = createRequire(import.meta.url);
const workspaceRoot = resolve(__dirname, '../..');

const appDependencies = Object.keys(JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8')).dependencies);
const rootDependencies = Object.keys(
  JSON.parse(readFileSync(join(workspaceRoot, 'package.json'), 'utf8')).dependencies,
);

// The vendor pre-bundle seeds root dependencies imported anywhere under a tsconfig path, i.e. every package in the
// web workspace (zone.js, platform-server, ...). The device only gets this app's dependencies.
process.env['NS_VENDOR_EXCLUDE'] = rootDependencies.filter((name) => !appDependencies.includes(name)).join(',');

export default defineConfig(({ mode }): UserConfig =>
  mergeConfig(angularConfig({ mode }), {
    resolve: {
      // Shared packages live outside this app; their bare imports must reach this app's (patched) copies.
      dedupe: ['@nativescript/angular', '@nativescript/core', '@triniwiz/nativescript-masonkit'],
      // ng-icon renders a font glyph on device; helm templates type-check against the real @ng-icons/core.
      alias: [
        { find: /^@ng-icons\/core$/, replacement: join(workspaceRoot, 'packages/ui/native/shims/ng-icons-core.ts') },
        // The chart paints TanStack's scene into a native view; helm templates type-check against the real package.
        {
          find: /^@tanstack\/angular-charts$/,
          replacement: join(workspaceRoot, 'packages/ui/native/shims/tanstack-angular-charts.ts'),
        },
      ],
    },
    // Bundling renames colliding classes (@nativescript/angular's TextNode becomes TextNode$1 next to MasonKit's);
    // NativeScript CSS type selectors and MasonKit's Angular adapter key off class names.
    build: { rolldownOptions: { output: { keepNames: true } } },
    plugins: [
      // File routes and Markdown: shared docs content lives outside this project, so it is added as a content dir.
      nativescriptAnalog({ contentDirs: ['/../../packages/shared/content'] }),
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(require.resolve('lucide-static/font/lucide.ttf')),
            dest: 'fonts',
            rename: { stripBase: true },
          },
        ],
      }),
    ],
  }),
);
