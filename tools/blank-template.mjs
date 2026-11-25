// Generates the blank app, the template for new apps, from this repository's own files.
// Usage: node tools/blank-template.mjs <output directory>
//
// The files in COPY are taken as they are, minus the lines between `template:demo` and `template:end` comments.
// templates/blank is then laid on top. .github/workflows/blank-template.yml checks the result and publishes it as the
// `blank` branch, which apps merge with `npm run update:template`.
import { execFileSync, execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const overlay = join(root, 'templates/blank');
const repository = 'https://github.com/herefishyfish/nativescript-unified.git';

/** Files, or directories ending in `/`, that the template takes from this repository. */
const COPY = [
  '.gitattributes',
  '.gitignore',
  'nx.json',
  'package.json',
  'package-lock.json',
  'tsconfig.base.json',
  'tools/apply-native-patches.mjs',
  'tools/native-patches/',
  'tools/patch-nativescript-vite.mjs',
  'apps/native/App_Resources/',
  'apps/native/nativescript.config.ts',
  'apps/native/package.json',
  'apps/native/project.json',
  'apps/native/references.d.ts',
  'apps/native/src/app.css',
  'apps/native/src/app/app.component.ts',
  'apps/native/src/app/pages/[...notfound].page.ts',
  'apps/native/src/main.ts',
  'apps/native/src/polyfills.ts',
  'apps/native/tools/',
  'apps/native/tsconfig.json',
  'apps/native/vite.config.mts',
  'apps/web/index.html',
  'apps/web/package.json',
  'apps/web/project.json',
  'apps/web/src/app/app.config.server.ts',
  'apps/web/src/app/app.config.ts',
  'apps/web/src/app/app.ts',
  'apps/web/src/app/core/theme.ts',
  'apps/web/src/app/layout/theme-toggle.ts',
  'apps/web/src/main.server.ts',
  'apps/web/src/main.ts',
  'apps/web/src/styles.css',
  'apps/web/tsconfig.app.json',
  'apps/web/tsconfig.json',
  'apps/web/vite.config.mts',
  'packages/analog-native/',
  'packages/shared/project.json',
  'packages/shared/src/raw.d.ts',
  'packages/shared/tsconfig.lib.json',
  'packages/ui/',
  'packages/web-polyfills/',
];

/** Text that names this project, as [file, from, to]. A `from` that is gone fails the run. */
const RENAME = [
  ['apps/native/nativescript.config.ts', 'org.nativescript.analogdemo', 'org.nativescript.blank'],
  ['apps/web/index.html', '<title>NativeScript Unified</title>', '<title>Blank app</title>'],
  ['apps/web/index.html', 'HTML-first NativeScript: one Angular template for web and native.', 'A NativeScript Unified app.'],
  ['apps/web/vite.config.mts', 'https://nativescript-unified.example', 'https://blank.example'],
];

/** Only the docs site, its audit and this generator use these. */
const DEMO_DEPENDENCIES = ['axe-core', 'playwright-core'];
const DEMO_SCRIPTS = ['audit:web', 'template:blank'];

function fail(message) {
  console.error(message);
  process.exit(1);
}

/** The text without its demo regions and markers. */
function stripDemo(text, file) {
  let opened = 0;
  const kept = text.split('\n').filter((line, index) => {
    if (/(\/\/|\/\*) template:demo\b/.test(line)) {
      if (opened) fail(`${file}:${index + 1}: template:demo inside the region opened on line ${opened}`);
      opened = index + 1;
      return false;
    }
    if (/(\/\/|\/\*) template:end\b/.test(line)) {
      if (!opened) fail(`${file}:${index + 1}: template:end without template:demo`);
      opened = 0;
      return false;
    }
    return !opened;
  });
  if (opened) fail(`${file}:${opened}: template:demo without template:end`);
  return kept.join('\n');
}

if (!process.argv[2]) fail('Usage: node tools/blank-template.mjs <output directory>');
const out = resolve(process.argv[2]);
if (existsSync(out) && readdirSync(out).some((name) => name !== '.git')) fail(`${out} is not empty`);

const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 })
  .split('\0')
  .filter(Boolean);
for (const entry of COPY) {
  const files = tracked.filter((file) => (entry.endsWith('/') ? file.startsWith(entry) : file === entry));
  if (!files.length) fail(`COPY: ${entry} matches no tracked file`);
  for (const file of files) {
    const target = join(out, file);
    mkdirSync(dirname(target), { recursive: true });
    const content = readFileSync(join(root, file));
    const marked = content.includes('template:demo') || content.includes('template:end');
    writeFileSync(target, marked ? stripDemo(content.toString('utf8'), file) : content);
  }
}

for (const [file, from, to] of RENAME) {
  const path = join(out, file);
  const text = readFileSync(path, 'utf8');
  if (!text.includes(from)) fail(`RENAME: "${from}" is not in ${file}`);
  writeFileSync(path, text.replaceAll(from, () => to));
}

const manifestPath = join(out, 'package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.name = 'blank';
for (const name of DEMO_DEPENDENCIES) {
  delete manifest.dependencies[name];
  delete manifest.devDependencies[name];
}
for (const name of DEMO_SCRIPTS) delete manifest.scripts[name];
manifest.scripts['update:template'] = `git pull --no-rebase --no-edit ${repository} blank && npm install`;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

cpSync(overlay, out, { recursive: true });

// Drops the removed packages from the copied lockfile and keeps every other version.
execSync('npm install --package-lock-only --ignore-scripts --no-audit --no-fund', { cwd: out, stdio: 'inherit' });
console.log(`Blank app written to ${out}`);
