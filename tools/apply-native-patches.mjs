// Applies the NativeScript fixes in tools/native-patches (tailwind, core, angular, vite, masonkit, ui-core-tabs) to
// node_modules. Each file is named for the version it was made against. Every hunk is applied on its own: skipped
// when it is already in place, applied whitespace-insensitively, or with fuzz if the installed version drifted. The
// outcome and the patch's hash are recorded in a marker file, so the script is idempotent and an edited patch file
// is applied again. A partial apply stays reported on every run until the patch is regenerated.
// Usage: node tools/apply-native-patches.mjs   (also runs from postinstall)
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
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
const scratch = mkdtempSync(join(tmpdir(), 'ns-unified-patches-'));

/** One patch file as single-hunk patches, each with its file header. */
function hunks(text) {
  const result = [];
  let header = '';
  let current = null;
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    if (line.startsWith('diff --git ')) {
      if (current) result.push(current);
      current = null;
      header = `${line}\n`;
    } else if (line.startsWith('@@')) {
      if (current) result.push(current);
      current = `${header}${line}\n`;
    } else if (current) {
      current += `${line}\n`;
    } else {
      header += `${line}\n`;
    }
  }
  if (current) result.push(current);
  return result.map((hunk) => hunk.replace(/\n+$/, '\n'));
}

const run = (command, args, cwd) => spawnSync(command, args, { cwd, encoding: 'utf8' }).status === 0;

/** 'applied', 'ok' (already in place), 'fuzz' or 'FAILED' for one hunk. */
function applyHunk(hunk, name, dir) {
  const file = join(scratch, 'hunk.patch');
  writeFileSync(file, hunk);
  // From the repo root with --directory: inside a subdirectory, git apply silently skips paths outside it.
  const git = (...args) => run('git', ['apply', '--ignore-whitespace', `--directory=node_modules/${name}`, ...args, file], root);
  if (git('--check', '-R')) return 'ok';
  if (git()) return 'applied';
  return run(gitPatch, ['-p1', '-l', '-N', '--no-backup-if-mismatch', '-r', '-', '-i', file], dir) ? 'fuzz' : 'FAILED';
}

for (const file of readdirSync(patchDir).filter((f) => f.endsWith('.patch'))) {
  const key = file.slice(0, file.lastIndexOf('@'));
  const name = packages[key];
  const dir = name && join(root, 'node_modules', name);
  if (!dir || !existsSync(dir)) {
    console.log(`skip ${file}: ${name ?? key} not installed`);
    continue;
  }
  const text = readFileSync(join(patchDir, file), 'utf8');
  const hash = createHash('sha256').update(text).digest('hex').slice(0, 12);
  const marker = join(dir, '.ns-unified-patched');
  const previous = existsSync(marker) ? readFileSync(marker, 'utf8') : '';
  if (previous.split('\n')[0].includes(hash)) {
    console.log(previous.startsWith('PART') ? `PART ${file}: applied partially earlier\n${previous}` : `ok   ${file}: already applied`);
    continue;
  }
  const version = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).version;
  if (!file.endsWith(`@${version}.patch`)) console.log(`note ${file}: ${name} is ${version}`);

  const results = hunks(text).map((hunk) => ({ hunk, result: applyHunk(hunk, name, dir) }));
  const failed = results.filter(({ result }) => result === 'FAILED').map(({ hunk }) => hunk.split('\n')[0].replace('diff --git a/', 'FAILED ').split(' b/')[0]);
  const outcome = failed.length ? 'PART' : results.some(({ result }) => result === 'fuzz') ? 'fuzz' : 'ok';
  const applied = results.filter(({ result }) => result !== 'ok').length;
  console.log(`${outcome.padEnd(4)} ${file}: ${applied} of ${results.length} hunks applied now${failed.length ? `\n${failed.join('\n')}` : ''}`);
  writeFileSync(marker, `${outcome} ${new Date().toISOString()} ${hash}${failed.length ? `\n${failed.join('\n')}` : ''}\n`);
}
rmSync(scratch, { recursive: true, force: true });
