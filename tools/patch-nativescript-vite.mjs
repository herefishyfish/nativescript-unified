// Fixes for @nativescript/vite 8.0.18 HMR dev mode in a hoisted monorepo on Windows.
// Remove this script once the fixes ship upstream. --no-hmr builds need none of them.
//
// 1. `/@fs` ids are built as `/@fsC:/...` (no slash before the drive letter).
// 2. `/@fs/C:/...` resolves to `/C:/...`, which does not exist.
//    Together these 404 every hoisted deep import such as `rxjs/dist/esm/index.js`.
// 3. A hoisted deep file such as `@angular/core/fesm2022/_debug_node-chunk.mjs` is tried
//    as a bare specifier before its real path, and the bare lookup lands on the package
//    entry, so the device gets `core.mjs` under the chunk URL. Trying the real file first
//    serves the right module.
// 4. `import css from 'x.css?raw'` fails the /ns/m link-check, which drops the query and checks Vite's DOM css
//    module (no default export). The /ns/m css route always exports the css text, so css targets are skipped.
// 5. That css route also drops `?raw` and registers the file as app css. With `?raw` it now only exports the text.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const replacements = [
  {
    file: 'hmr/server/websocket-ns-m-request.js',
    broken: 'const fsId = `/@fs${rootPosix}${',
    fixed: "const fsId = `/@fs${rootPosix.startsWith('/') ? '' : '/'}${rootPosix}${",
  },
  {
    file: 'hmr/server/websocket-module-specifiers.js',
    broken: "absPath = cleaned.slice('/@fs'.length);",
    fixed: String.raw`absPath = cleaned.slice('/@fs'.length).replace(/^\/([A-Za-z]:)/, '$1');`,
  },
  {
    file: 'hmr/server/websocket-ns-m.js',
    broken: "let targetCode = '';",
    fixed: "let targetCode = '';\n                            if (CSS_MODULE_RE.test(u.pathname))\n                                continue;",
  },
  {
    file: 'hmr/server/websocket-ns-m.js',
    broken: 'const inlineRes = await sharedTransformRequest(`${inlineSpec}?inline`);',
    fixed:
      "const cssRaw = urlObj.searchParams.has('raw');\n                    const inlineRes = await sharedTransformRequest(`${inlineSpec}?${cssRaw ? 'raw' : 'inline'}`);",
  },
  {
    file: 'hmr/server/websocket-ns-m.js',
    broken: "buildCssRegisterSnippetFromVar(spec, '__ns_css_text__')",
    fixed: "(cssRaw ? '' : buildCssRegisterSnippetFromVar(spec, '__ns_css_text__'))",
  },
];

const require = createRequire(join(process.cwd(), 'apps/native/package.json'));
let pkgDir;
try {
  pkgDir = dirname(require.resolve('@nativescript/vite'));
} catch {
  process.exit(0);
}

function patch(file, transform) {
  const path = join(pkgDir, file);
  const source = readFileSync(path, 'utf8');
  const result = transform(source);
  if (result !== source) {
    writeFileSync(path, result);
    console.log(`[patch-nativescript-vite] patched ${file}`);
  }
}

for (const { file, broken, fixed } of replacements) {
  patch(file, (source) => (source.includes(fixed) ? source : source.replace(broken, () => fixed)));
}

patch('hmr/server/websocket-ns-m-request.js', (source) => {
  const bare = source.indexOf("    if (spec.includes('/node_modules/')) {");
  const fsAnchored = source.indexOf('    const fsId = resolveFsAnchoredSpec(spec, serverRoot, workspaceRoot);');
  const end = source.indexOf('    for (const candidate of transformCandidates) {\n        const importHintCandidate');
  if (bare === -1 || fsAnchored === -1 || end === -1 || !(bare < fsAnchored && fsAnchored < end)) {
    return source;
  }
  return source.slice(0, bare) + source.slice(fsAnchored, end) + source.slice(bare, fsAnchored) + source.slice(end);
});

