import { angularConfig } from '@nativescript/vite/angular';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { defineConfig, mergeConfig, normalizePath, type Plugin, type UserConfig } from 'vite';
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

// The example screens draw these helm components with @nativescript-community widgets (docs/native-elements); every
// other file keeps spartan's MasonKit components. Each shim, packages/ui/native/shims/helm-<name>.ts, needs its package.
const NATIVE_HELM = ['switch', 'checkbox', 'slider', 'sonner'];
const NATIVE_HELM_IMPORTERS = /\/packages\/shared\/src\/lib\/examples\//;
// Spartan's slider and toaster measure elements and follow pointer events, which native views have neither of, so
// every other file gets these shims (slider: MasonKit's range input, or a touch-driven range; toaster: a stack of toasts).
const ALWAYS_NATIVE_HELM: Record<string, string> = { slider: 'masonkit-slider', sonner: 'helm-sonner' };

/**
 * Resolves `@spartan-ng/helm/<name>` in NATIVE_HELM to its native shim, for the files NATIVE_HELM_IMPORTERS matches,
 * and in ALWAYS_NATIVE_HELM to its shim for every other file.
 */
function nativeHelm(): Plugin {
  const shim = (file: string) => join(workspaceRoot, `packages/ui/native/shims/${file}.ts`);
  return {
    name: 'native-helm',
    enforce: 'pre',
    resolveId: {
      // Ahead of @nativescript/vite's tsconfig-paths resolver, which would map the import to the real helm source.
      order: 'pre',
      handler(source, importer) {
        const name = source.startsWith('@spartan-ng/helm/') ? source.slice('@spartan-ng/helm/'.length) : null;
        if (!name || !importer) return null;
        if (NATIVE_HELM.includes(name) && NATIVE_HELM_IMPORTERS.test(normalizePath(importer))) return shim(`helm-${name}`);
        return name in ALWAYS_NATIVE_HELM ? shim(ALWAYS_NATIVE_HELM[name]) : null;
      },
    },
  };
}

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
      nativeHelm(),
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
