// Applies the NativeScript fixes spartan's native-demo carries as pnpm patches (tailwind, core, angular, vite,
// masonkit) to node_modules. They were written against slightly older versions, so each is applied leniently
// (whitespace-insensitive, fuzz) and recorded with a marker file so the script is idempotent.
// Usage: node tools/apply-native-patches.mjs   (also runs from postinstall)
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const patchDir = join(root, 'tools/native-patches');
const packages = {
  '@nativescript__tailwind': '@nativescript/tailwind',
  '@nativescript__core': '@nativescript/core',
  '@nativescript__angular': '@nativescript/angular',
  '@nativescript__vite': '@nativescript/vite',
  '@triniwiz__nativescript-masonkit': '@triniwiz/nativescript-masonkit',
  '@nativescript-community__ui-core-tabs': '@nativescript-community/ui-core-tabs',
};
const gitPatch = ['C:/Program Files/Git/usr/bin/patch.exe', 'patch'].find((p) => p === 'patch' || existsSync(p));

for (const file of readdirSync(patchDir).filter((f) => f.endsWith('.patch'))) {
  const key = file.slice(0, file.lastIndexOf('@'));
  const name = packages[key];
  const dir = name && join(root, 'node_modules', name);
  if (!dir || !existsSync(dir)) {
    console.log(`skip ${file}: ${name ?? key} not installed`);
    continue;
  }
  const marker = join(dir, '.ns-unified-patched');
  if (existsSync(marker)) {
    console.log(`ok   ${file}: already applied`);
    continue;
  }
  const patch = join(patchDir, file);
  let result = spawnSync('git', ['apply', '--ignore-whitespace', `--directory=node_modules/${name}`, patch], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    // Version drift: retry hunk by hunk with fuzz. Hunks that no longer apply are already fixed upstream or reported.
    result = spawnSync(gitPatch, ['-p1', '-l', '--no-backup-if-mismatch', '-r', '-', '-i', patch], { cwd: dir, encoding: 'utf8' });
    console.log(`${result.status === 0 ? 'fuzz' : 'PART'} ${file}\n${(result.stdout || '').trim().split('\n').filter((l) => /FAILED|ignored/.test(l)).join('\n')}`);
  } else {
    console.log(`ok   ${file}`);
  }
  writeFileSync(marker, new Date().toISOString());
}