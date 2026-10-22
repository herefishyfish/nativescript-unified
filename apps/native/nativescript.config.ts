import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'org.nativescript.analogdemo',
  appPath: 'src',
  appResourcesPath: 'App_Resources',
  bundler: 'vite',
  bundlerConfigPath: 'vite.config.mts',
  // Kept outside hooks/, which `ns clean` deletes.
  hooks: [
    { type: 'before-prepare', script: 'tools/gradle-env.mjs' },
    { type: 'before-prepare', script: 'tools/link-core.mjs' },
  ],
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
  },
} as NativeScriptConfig;
