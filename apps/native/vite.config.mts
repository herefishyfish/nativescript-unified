import { defineConfig, mergeConfig } from 'vite';
import { angularConfig } from '@nativescript/vite/angular';
// Imported from source so plugin edits apply without rebuilding the package.
import { nativescriptAnalog } from '../../packages/analog-native/vite/src/index.ts';

export default defineConfig(({ mode }) =>
  mergeConfig(angularConfig({ mode }), {
    plugins: [nativescriptAnalog()],
  }),
);

