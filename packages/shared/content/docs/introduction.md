---
title: Introduction
section: Getting started
order: 1
description: HTML-first NativeScript, and how web and native split.
---

# Introduction

nativescript-unified is one Nx monorepo for an **HTML-first** NativeScript Angular design. You write pages as ordinary HTML (`<div>`, `<p>`, `<h1>`, `<ul>`, `<a href>`), style them with Tailwind classes, and build richer UI from Spartan helm components. The same templates run in two places:

- **On the web**, in a browser, through an [AnalogJS](https://analogjs.org) app built with Vite.
- **On a device**, as native views. [MasonKit](https://github.com/triniwiz/nativescript-mason) registers HTML-shaped native elements with `@nativescript/angular`, so plain HTML element names render natively and CSS flex and grid do the layout.

```html live
<section hlmCard class="max-w-md">
  <div hlmCardHeader>
    <div hlmCardTitle>HTML first</div>
    <p hlmCardDescription>Plain elements, flex, Tailwind and a helm card.</p>
  </div>
  <div hlmCardContent class="flex flex-row items-center gap-2">
    <button hlmBtn>Primary</button>
    <button hlmBtn variant="outline">Outline</button>
    <span hlmBadge variant="secondary">Spartan</span>
  </div>
</section>
```

Every live demo in these docs is the code shown beside it, compiled at run time: in your browser on the web, and on the device in the native app. Nothing is mocked.

## Where to start

1. [HTML first](/docs/html-first): the approach, and what replaces each NativeScript tag.
2. [Layout with flex and grid](/docs/html-layout).
3. [Components](/docs/components): live Spartan helm examples.
4. [Theming](/docs/theming): the cream and teal tokens and dark mode.
5. [Project structure](/docs/project-structure) and [File-based routing](/docs/file-routing).

New here? Start with [Installation](/docs/installation) and [Web vs native](/docs/web-vs-native).

## Web and native stay separate

Web and native diverge often, so they are separate apps at the top of the workspace. Each owns its own pages and its own core (providers, bootstrap, platform setup). Everything both can share lives underneath:

| Layer | Where | What it holds |
| --- | --- | --- |
| Web | `apps/web` | AnalogJS app: `pages/`, web providers |
| Native | `apps/native` | NativeScript Angular app: `pages/`, native bootstrap |
| Shared | `packages/shared` | HTML-first components and Markdown content |
| UI | `packages/ui` | Spartan `brain` (headless) and `helm` (styled) components, plus the theme tokens |

See [Project structure](/docs/project-structure) for the full map.

## Legacy NativeScript tags

NativeScript apps are often written with tags such as `<StackLayout>` and `<Label>`. The `web-polyfills` package implements those tags as Angular components so an existing NativeScript tree also renders in a browser. That is **legacy support**, kept for markup that already exists, not the way to write new code. It has its own section: [Legacy NativeScript tags](/docs/legacy-tags).

## Status

The web app builds and prerenders this site. The native app builds and runs on Android, and it renders these same docs pages with their live demos. That was checked on an Android emulator (API 36). iOS has not been built yet. Each component page ends with a Native note that says what was seen on the emulator. See [Web vs native](/docs/web-vs-native) for the known native limitations.