---
title: Project structure
section: Getting started
order: 3
description: apps/web, apps/native and packages/*.
---

# Project structure

```text
apps/
  web/               AnalogJS app (@analogjs/platform, Vite)
  native/            NativeScript Angular app (@nativescript/vite)
packages/
  shared/            HTML-first components and Markdown content used by both
  ui/                Spartan brain + helm, plus styles/ (Tailwind preset, tokens)
  web-polyfills/     Angular components for NativeScript tags on the web
  analog-native/     File-based router and Markdown for NativeScript Angular
docs/design.md       analog-native design notes (it calls the package `@nativescript/analog`; here it is `@nativescript-unified/analog-native`)
```

## apps/web

An AnalogJS app. File routes live in `src/app/pages`. The web core is `src/app/app.config.ts` (zoneless change detection, `provideFileRouter`, `provideNsElements`). This documentation site is this app, and it is prerendered to static HTML at build time.

## apps/native

A NativeScript Angular app built with `@nativescript/vite`. File routes live in `src/app/pages`, provided by `analog-native`. It has its own bootstrap in `src/main.ts`, which calls `installMasonKit()` and `provideFileRouter()`. Today it is verified with `tsc` only. See [Web vs native](/docs/web-vs-native).

## packages/shared

HTML-first Angular components and the Markdown content for these docs (`packages/shared/content/docs`). Templates use plain HTML elements and Tailwind classes only, with no platform imports, so both apps can render them.

## packages/ui

Spartan UI: `brain` is headless, `helm` is styled. They are consumed from source through `tsconfig.base.json` paths, with the import names `@spartan-ng/brain/*` and `@spartan-ng/helm/*`. The folder also holds `styles/`, which contains the Tailwind preset, `style-vega.css` and `tokens.css`, the single source of colour tokens.

## packages/web-polyfills

Angular components that implement NativeScript view tags on the web. Layouts: StackLayout, GridLayout, WrapLayout, AbsoluteLayout, DockLayout, FlexboxLayout and SplitView. See [StackLayout](/docs/stack-layout), [Label](/docs/label) and [Polyfill limitations](/docs/polyfill-limitations).

## packages/analog-native

File-based routing and Markdown content for NativeScript Angular, ported from the `nativescript-analog` project. It keeps AnalogJS's file conventions and renders Markdown to native views.

## Package scope

Workspace packages are imported as `@nativescript-unified/<name>` and mapped in `tsconfig.base.json` `paths`. The scope is a placeholder, so renaming it is a change to those paths and the package names.

## Commands

```bash
npm install
npx nx serve web                 # dev server
npx nx build web                 # prerendered static site in dist/apps/web/analog/public
npx nx run web:preview           # serve that build on port 4300
npm run audit:web                # headless Edge checks against the preview
npx nx test web-polyfills        # polyfill unit tests
npx nx test analog-native        # router unit tests
npx nx run-many -t typecheck     # tsc for every project
```