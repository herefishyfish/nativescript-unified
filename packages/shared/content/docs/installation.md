---
title: Installation
section: Getting started
order: 2
description: Install the workspace, run the web docs, and run the native app on Android.
---

# Installation

nativescript-unified is an Nx workspace. Everything below comes from the root `package.json` and the `project.json` file of each app.

## Requirements

- Node and npm. Angular 22.2 supports Node `^22.22.3`, `^24.15.0` or `>=26`. An older Node still installs, with engine warnings.
- For native: the NativeScript CLI (`ns`), plus the Android SDK for Android, or a Mac with Xcode for iOS.

## Install

```bash
npm install
```

`postinstall` runs two scripts. `tools/apply-native-patches.mjs` applies the NativeScript fixes that Spartan's native demo carries (to `@nativescript/tailwind`, `@nativescript/core`, `@nativescript/angular`, `@nativescript/vite` and MasonKit). It records a marker file, so running it again does nothing. `tools/patch-nativescript-vite.mjs` then fixes `@nativescript/vite` HMR dev mode for a hoisted monorepo on Windows. Builds with `--no-hmr`, such as `native:android`, do not need that fix.

## Run the web docs

```bash
npx nx serve web          # dev server, same as: npm run web
npx nx build web          # prerendered static site
npx nx run web:preview    # serves the build on http://localhost:4300
npm run audit:web         # headless Edge checks against the preview
```

`nx build web` prerenders `/` and every `/docs/:slug`, and writes the result to `dist/apps/web/analog/public`. `web:preview` depends on the build and serves that folder.

## Run native

```bash
npx nx run native:android
```

This runs `ns run android --no-hmr` with the `arm64-v8a` and `x86_64` ABIs. It builds the app and runs it on an Android emulator or device. It was checked on an emulator with API 36 (x86_64). The other native targets are `debug-android`, `build-android` and `clean`.

If you call `ns` yourself from PowerShell, quote the Gradle argument: `ns build android '--gradleArgs=-Pabis=arm64-v8a,x86_64'`. Without the quotes, PowerShell splits the value at the comma, and the APK ships without its native libraries. On Windows, a `before-prepare` hook (`apps/native/tools/gradle-env.mjs`) clears `NoDefaultCurrentDirectoryInExePath` so the CLI can run `gradlew.bat`.

For iOS, run `ns run ios` from `apps/native` on a Mac with Xcode. There is no `native:ios` Nx target in `apps/native/project.json` yet, so the root `ios` script, which names one, does not work.

## Check your work

```bash
npx nx test web-polyfills
npx nx test analog-native
npx nx run-many -t typecheck
```

## Your first page

Pages are files. Create `apps/web/src/app/pages/hello.page.ts` while `nx serve web` is running, and the dev server serves it at `/hello`:

```ts
import { Component } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'web-hello-page',
  imports: [HlmButton, HlmCardImports],
  template: `<!-- the HTML below -->`,
})
export default class HelloPage {}
```

The template is plain HTML with Tailwind classes and helm attributes. This one is running live:

```html live
<div class="flex flex-col gap-4 p-4">
  <h1 class="text-2xl font-bold">Hello, HTML first</h1>
  <section hlmCard class="max-w-sm">
    <div hlmCardHeader>
      <div hlmCardTitle>One template</div>
      <p hlmCardDescription>The same markup renders in a browser and as native views.</p>
    </div>
    <div hlmCardFooter class="gap-2">
      <button hlmBtn>Get started</button>
      <button hlmBtn variant="outline">Learn more</button>
    </div>
  </section>
</div>
```

The native app has its own `pages/` folder with the same conventions. See [File-based routing](/docs/file-routing). To write a template once and render it in both apps, put it in `packages/shared`. See [Writing shared HTML features](/docs/shared-features).

## Next steps

Read [Project structure](/docs/project-structure) and [Web vs native](/docs/web-vs-native).
