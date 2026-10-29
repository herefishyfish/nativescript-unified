// Applies the NativeScript fixes in tools/native-patches (tailwind, core, angular, vite, masonkit, ui-core-tabs) to
// node_modules. Each file is named for the version it was made against. A patch is applied whitespace-insensitively,
// then hunk by hunk with fuzz if the installed version drifted, and its outcome is recorded in a marker file so the
// script is idempotent. A partial apply stays reported on every run until the patch is regenerated.
// Usage: node tools/apply-native-patches.mjs   (also runs from postinstall)
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
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
    const previous = readFileSync(marker, 'utf8');
    console.log(previous.startsWith('PART') ? `PART ${file}: applied partially earlier\n${previous}` : `ok   ${file}: already applied`);
    continue;
  }
  const version = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).version;
  if (!file.endsWith(`@${version}.patch`)) console.log(`note ${file}: ${name} is ${version}`);
  const patch = join(patchDir, file);
  let outcome = 'ok';
  let detail = '';
  let result = spawnSync('git', ['apply', '--ignore-whitespace', `--directory=node_modules/${name}`, patch], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    // Version drift: retry hunk by hunk with fuzz, skipping hunks that are already applied.
    result = spawnSync(gitPatch, ['-p1', '-l', '-N', '--no-backup-if-mismatch', '-r', '-', '-i', patch], { cwd: dir, encoding: 'utf8' });
    outcome = result.status === 0 ? 'fuzz' : 'PART';
    detail = (result.stdout || '').trim().split('\n').filter((l) => /FAILED|ignored/.test(l)).join('\n');
  }
  console.log(`${outcome.padEnd(4)} ${file}${detail ? `\n${detail}` : ''}`);
  writeFileSync(marker, `${outcome} ${new Date().toISOString()}${detail ? `\n${detail}` : ''}\n`);
}
