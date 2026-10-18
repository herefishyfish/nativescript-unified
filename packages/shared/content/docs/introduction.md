---
title: Introduction
section: Getting started
order: 1
description: HTML-first NativeScript, and how web and native split.
---

# Introduction

nativescript-unified is one Nx monorepo for an **HTML-first** NativeScript Angular design. You write pages as ordinary HTML (`<div>`, `<p>`, `<h1>`, `<ul>`, `<a href>`) and the same templates run in two places:

- **On the web**, in a browser, through an [AnalogJS](https://analogjs.org) app built with Vite.
- **On a device**, as native views. [MasonKit](https://github.com/triniwiz/nativescript-mason) registers HTML-shaped native elements with `@nativescript/angular`, so plain HTML element names render natively and CSS flex and grid do the layout.

## Web and native stay separate

Web and native diverge often, so they are separate apps at the top of the workspace. Each owns its own pages and its own core (providers, bootstrap, platform setup). Everything both can share lives underneath:

| Layer | Where | What it holds |
| --- | --- | --- |
| Web | `apps/web` | AnalogJS app: `pages/`, web providers |
| Native | `apps/native` | NativeScript Angular app: `pages/`, native bootstrap |
| Shared | `packages/shared` | HTML-first components and Markdown content |
| UI | `packages/ui` | Spartan `brain` (headless) and `helm` (styled) components, plus the theme tokens |

See [Project structure](/docs/project-structure) for the full map.

## Legacy NativeScript tags on the web

NativeScript apps are often written with tags such as `<StackLayout>` and `<Label>`. The `web-polyfills` package implements those tags as Angular components whose selector is the NativeScript tag name. If you import them, a legacy tree renders in a browser:

```html live
<StackLayout class="gap-2 p-4 rounded-lg bg-card text-card-foreground border">
  <Label text="This is a NativeScript StackLayout"></Label>
  <Label text="rendered in the browser by web-polyfills"></Label>
</StackLayout>
```

Every live demo in these docs is the code shown below it, compiled in your browser with the real polyfill components. Nothing is mocked.

Note that the polyfills are Angular components that you import where you use them. They are not registered as DOM custom elements, because a custom element name must contain a hyphen and `StackLayout` does not.

## What this site covers

1. [Project structure](/docs/project-structure) and [File-based routing](/docs/file-routing).
2. The seven layouts: [StackLayout](/docs/stack-layout), [GridLayout](/docs/grid-layout), [FlexboxLayout](/docs/flexbox-layout), [WrapLayout](/docs/wrap-layout), [DockLayout](/docs/dock-layout), [AbsoluteLayout](/docs/absolute-layout) and [SplitView](/docs/split-view).
3. The views the polyfills implement, starting at [Label](/docs/label), plus [Navigation views](/docs/navigation-views).
4. Guides: [Theming](/docs/theming), [Markdown content on native](/docs/markdown-on-native), [Writing shared HTML features](/docs/shared-features), [Polyfill limitations](/docs/polyfill-limitations) and the [FAQ](/docs/faq).

New here? Start with [Installation](/docs/installation) and [Web vs native](/docs/web-vs-native).

This site is the web half of the work. The native app builds today only as a type check; it has not yet been run on a device.