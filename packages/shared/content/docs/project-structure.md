---
title: Project structure
section: Getting started
order: 3
description: apps/web, apps/native and packages/*.
---

# Project structure

```text
apps/
  web/                 AnalogJS app (@analogjs/platform, Vite). This documentation site.
  native/              NativeScript Angular app (@nativescript/vite)
packages/
  shared/              HTML-first components, example screens and the Markdown for these docs
  ui/                  Spartan brain + helm, styles/ (Tailwind preset, tokens) and native/ (NativeScript glue)
  web-polyfills/       Angular components for legacy NativeScript tags on the web
  analog-native/       File-based router and Markdown for NativeScript Angular
tools/                 postinstall patches, the web audit and the contrast checker
docs/design.md         analog-native design notes
```

`docs/design.md` calls the router package `@nativescript/analog`. In this workspace it is `@nativescript-unified/analog-native`.

## apps/web

An AnalogJS app. File routes live in `src/app/pages`. The web core is `src/app/app.config.ts` (zoneless change detection, `provideFileRouter`, `provideNsElements`). This documentation site is this app, and it is prerendered to static HTML at build time. The docs Markdown is parsed at build time by `tools/docs-plugin.ts`.

## apps/native

A NativeScript Angular app built with `@nativescript/vite`. File routes live in `src/app/pages`, provided by `analog-native`. Its bootstrap in `src/main.ts` calls `installMasonKit()` before Angular starts, then provides `provideFileRouter()` and `provideSpartanNativeScript()`. Its home screen has three bottom tabs: Guide and Components, which list these docs pages, and UI, which opens the shared example screens. Its main targets are iOS and Android. See [Web vs native](/docs/web-vs-native).

## packages/shared

Everything both apps render:

- `src/lib/home`: a small shared feature, `HomeFeature`, with its data in `src/lib/content.ts`.
- `src/lib/examples`: twelve example screens (pricing, checkout, analytics, music player and more). Each one is HTML, Tailwind and helm with its own palette. The home page of this site shows them live, and so does the native app's UI tab.
- `content/docs`: the Markdown for these docs.

Templates use plain HTML elements, Tailwind classes and helm only, with no platform imports. See [Writing shared HTML features](/docs/shared-features).

## packages/ui

Spartan UI. `brain` is headless and `helm` is styled. They are consumed from source through `tsconfig.base.json` paths, with the import names `@spartan-ng/brain/*` and `@spartan-ng/helm/*`.

- `styles/` holds the Tailwind preset, `style-vega.css` and `tokens.css`, the single source of colour tokens. See [Theming](/docs/theming).
- `native/` is the NativeScript side of Spartan: the CDK shims, the element registrations, the native overlay host behind the dialog, sheet, popover and menu, and CSS overrides. `provideSpartanNativeScript()` installs it.

## packages/web-polyfills

Legacy support: Angular components that implement NativeScript view tags on the web, so existing NativeScript markup renders in a browser. Native never imports it. See [Legacy NativeScript tags](/docs/legacy-tags) and [Polyfill limitations](/docs/polyfill-limitations).

## packages/analog-native

File-based routing and Markdown content for NativeScript Angular, ported from the `nativescript-analog` project. It keeps AnalogJS's file conventions and renders Markdown to native views. See [File-based routing](/docs/file-routing) and [Markdown content on native](/docs/markdown-on-native).

## Package scope

Workspace packages are imported as `@nativescript-unified/<name>` and mapped in `tsconfig.base.json` `paths`. The scope is a placeholder, so renaming it is a change to those paths and the package names.

The commands for each app are in [Installation](/docs/installation).
