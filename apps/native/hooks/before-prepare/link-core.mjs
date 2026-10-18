// Some NativeScript plugins' Gradle files (e.g. @nativescript-community/gesturehandler) hard-code
// $USER_PROJECT_ROOT/node_modules/@nativescript/core/platforms/android. npm workspaces hoist @nativescript/core to the
// repo root, so link it into apps/native/node_modules before the plugin Gradle builds run.
import { existsSync, mkdirSync, symlinkSync, lstatSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';

export default function () {
  const appDir = process.cwd();
  const target = join(appDir, 'node_modules/@nativescript/core');
  if (existsSync(join(target, 'platforms/android'))) return;
  const require = createRequire(join(appDir, 'package.json'));
  const hoisted = dirname(require.resolve('@nativescript/core/package.json'));
  if (hoisted === target) return;
  mkdirSync(dirname(target), { recursive: true });
  try { lstatSync(target); } catch { symlinkSync(hoisted, target, 'junction'); }
  console.log(`[ns-unified] linked ${target} -> ${hoisted}`);
}
