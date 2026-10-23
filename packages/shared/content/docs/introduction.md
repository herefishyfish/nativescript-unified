---
title: Introduction
section: Getting started
order: 1
description: HTML-first NativeScript, and how web and native split.
---

# Introduction

nativescript-unified is an Nx monorepo for building NativeScript Angular apps the **HTML-first** way. You write pages as ordinary HTML (`<div>`, `<p>`, `<h1>`, `<ul>`, `<a href>`), lay them out with CSS flex and grid, style them with Tailwind classes, and build richer UI from Spartan helm components. The same template runs in two places:

- **In a browser**, through an [AnalogJS](https://analogjs.org) app built with Vite. This site is that app.
- **On a device**, as real native views. [MasonKit](https://github.com/triniwiz/nativescript-mason) registers HTML-shaped elements with `@nativescript/angular`. Each one is a native view, not a web view, and Mason, a Rust layout engine built on [taffy](https://github.com/DioxusLabs/taffy), lays them out with CSS flex, grid and block flow.

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

Every live demo in these docs is the code shown in its Code tab, compiled at run time against the components in this workspace: in your browser on the web, and on the device in the native app. Nothing is mocked.

## How the pieces fit

Web and native diverge often, so they are separate apps at the top of the workspace. Each owns its own pages and its own core (providers, bootstrap, platform setup). Everything both can use lives underneath:

| Layer | Where | What it holds |
| --- | --- | --- |
| Web | `apps/web` | AnalogJS app: `pages/`, web providers |
| Native | `apps/native` | NativeScript Angular app: `pages/`, native bootstrap |
| Shared | `packages/shared` | HTML-first components, example screens and the Markdown for these docs |
| UI | `packages/ui` | Spartan `brain` (headless) and `helm` (styled) components, the theme tokens and the NativeScript glue |

[Project structure](/docs/project-structure) has the full map, and [Web vs native](/docs/web-vs-native) explains how to decide where code goes.

## Where to start

1. [Installation](/docs/installation): install the workspace and run both apps.
2. [Project structure](/docs/project-structure) and [Web vs native](/docs/web-vs-native): what lives where.
3. [HTML first](/docs/html-first), then [Layout with flex and grid](/docs/html-layout) and [Theming](/docs/theming): how pages are written.
4. [Components](/docs/components): live Spartan helm examples, and what each one does on native.
5. [File-based routing](/docs/file-routing) and [Markdown content on native](/docs/markdown-on-native): pages and content on both platforms.

Short answers to common questions are in the [FAQ](/docs/faq).

## Legacy NativeScript tags

NativeScript apps are often written with tags such as `<StackLayout>` and `<Label>`. The `web-polyfills` package implements those tags as Angular components so an existing NativeScript tree also renders in a browser. That is **legacy support**, kept for markup that already exists, not the way to write new code. It has its own section: [Legacy NativeScript tags](/docs/legacy-tags).

## Platforms

The main targets are the **web**, **iOS** and **Android**. The same NativeScript app also runs on macOS and Windows, which are not the main focus.

The web app builds and prerenders this site. The native app renders these same docs pages with their live demos on the device. Each component page ends with a Native note that records what was seen on an Android emulator (API 36), and [Native status](/docs/components#native-status) sums them up in one table. Those notes have not been re-checked on iOS yet. Limits that apply to every component are in [Known native limitations](/docs/web-vs-native#known-native-limitations).
