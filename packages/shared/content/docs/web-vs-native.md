---
title: Web vs native
section: Getting started
order: 4
description: What each app owns, what they share, and how to decide where code goes.
---

# Web vs native

Web and native diverge often, so they are two apps at the top of the workspace. Each has its own pages and its own core. Shared HTML and features sit underneath both. The approach on both is [HTML first](/docs/html-first).

## The core of each app

| Area | Web (`apps/web`) | Native (`apps/native`) |
| --- | --- | --- |
| Entry | `src/main.ts`, `src/app/app.config.ts` | `src/main.ts` |
| Router | `provideFileRouter` from `@analogjs/router` | `provideFileRouter` from `@nativescript-unified/analog-native` |
| Change detection | `provideZonelessChangeDetection()` | `provideZonelessChangeDetection()` |
| Root component | `app.ts` | `<page-router-outlet />` in `app.component.ts` |
| View layer | Browser DOM | MasonKit, installed by `installMasonKit()` before bootstrap |
| Build | Vite with `@analogjs/platform`, prerendered | Vite with `@nativescript/vite` and the `nativescriptAnalog()` plugin |
| Dark mode | `dark` class on `<html>` | `ns-dark` class on the root view |
| Styling | Tailwind and Spartan helm | Tailwind through `@nativescript/tailwind` and Spartan helm, with the same `tokens.css` |
| Legacy NativeScript tags | Rendered by `web-polyfills`, for existing markup only | Real native views |

## Pages

Both use `src/app/pages` and the same file conventions, but a page is written for its platform.

A web page imports `RouterLink` and Spartan helm components. A native page imports `ActionBarComponent` from `@nativescript/angular`, sets `NO_ERRORS_SCHEMA`, and wraps its content in `<scroll>`:

```ts
@Component({
  selector: 'shared-page',
  imports: [ActionBarComponent, HomeFeature],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <ActionBar title="Shared HTML" />
    <scroll>
      <app-home-feature />
    </scroll>
  `,
})
export default class SharedPage {}
```

That is `apps/native/src/app/pages/shared.page.ts`. The `HomeFeature` it renders lives in `packages/shared`, and the web home page reads the same `FEATURES` data.

## What is shared

`packages/shared` holds HTML-first components and content. They use plain elements and Tailwind classes, with no platform imports. Here is the shape of a shared feature, running live:

```html live
<div class="flex flex-col gap-4 p-4 rounded-lg border bg-background text-foreground">
  <h1 class="text-2xl font-bold">NativeScript, HTML first</h1>
  <p class="text-muted-foreground">One set of HTML pages. Web and native stay separate at the top.</p>
  <div class="flex flex-col gap-1 p-3 rounded-lg bg-card text-card-foreground">
    <h2 class="text-base font-semibold">HTML first</h2>
    <p class="text-sm text-muted-foreground">Plain HTML on both platforms.</p>
  </div>
</div>
```

## Where does new code go

1. If it is plain HTML plus tokens and has no platform imports, put it in `packages/shared`. See [Writing shared HTML features](/docs/shared-features).
2. If it needs a router service, a native API, or a Spartan component, put it in the app that uses it.
3. If a legacy NativeScript tag must render in a browser, it belongs in `packages/web-polyfills`. Native never imports that package, because on a device those tags are real views. See [Legacy NativeScript tags](/docs/legacy-tags).

## Spartan on native

`apps/native/src/app/pages/ui.page.ts` imports `HlmButton`, `HlmBadge` and `HlmCardImports`, and `packages/ui/native` holds the glue helm needs on NativeScript. That page has been type-checked and bundled. It has not been confirmed on a device in these docs, so treat native helm as in progress. See [Components](/docs/components) for what is demonstrated on the web.