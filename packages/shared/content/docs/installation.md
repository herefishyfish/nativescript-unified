---
title: Installation
section: Getting started
order: 2
description: Install the workspace, run the web docs, and run the native app on Android.
---

# Installation

nativescript-unified is an Nx workspace. Everything below comes from the root `package.json`, `README.md` and the `project.json` file of each app.

## Requirements

- Node and npm. The workspace was set up on Node 24.14. Angular 22.2 asks for 24.15, so you may see engine warnings. They were warnings only.
- For native: the NativeScript CLI (`ns`) and the Android SDK. The `native:android` target runs `ns run android`.

## Install

```bash
npm install
```

`postinstall` runs `tools/patch-nativescript-vite.mjs`, which patches `@nativescript/vite`.

## Run the web docs

```bash
npx nx serve web          # dev server, same as: npm run web
npx nx build web          # prerendered static site
npx nx run web:preview    # serves the build on http://localhost:4300
npm run audit:web         # headless Edge checks against the preview
```

`nx build web` prerenders `/` and every `/docs/:slug`, and writes the result to `dist/apps/web/analog/public`. `web:preview` depends on the build and serves that folder.

## Check your work

```bash
npx nx test web-polyfills
npx nx test analog-native
npx nx run-many -t typecheck
```

## Run native

```bash
npx nx run native:android
```

This runs `ns run android --no-hmr` with the `arm64-v8a` and `x86_64` ABIs. The other native targets are `debug-android`, `build-android` and `clean`.

This command builds the app and runs it on an Android emulator. It was checked on an emulator with API 36 (x86_64).

If you call `ns` yourself from PowerShell, quote the Gradle argument: `ns build android '--gradleArgs=-Pabis=arm64-v8a,x86_64'`. Without the quotes, PowerShell splits the value at the comma, and the APK ships without its native libraries. On Windows, a `before-prepare` hook (`apps/native/tools/gradle-env.mjs`) clears `NoDefaultCurrentDirectoryInExePath` so the CLI can run `gradlew.bat`.

There is no `native:ios` target in `apps/native/project.json` yet, even though the root `package.json` has an `ios` script that names one. iOS has not been built in this workspace.

## What you should see

The starter page is shared HTML with a polyfilled layout row and Spartan buttons. This is the kind of block the web app renders, running live:

```html live
<StackLayout class="gap-3 p-4 rounded-lg border bg-card text-card-foreground">
  <Label text="Hello from nativescript-unified"></Label>
  <StackLayout orientation="horizontal" class="gap-2">
    <button hlmBtn>Read the docs</button>
    <button hlmBtn variant="outline">StackLayout demo</button>
  </StackLayout>
</StackLayout>
```

Next, read [Project structure](/docs/project-structure) and [Web vs native](/docs/web-vs-native).