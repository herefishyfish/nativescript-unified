---
title: Web vs native
section: Getting started
order: 4
description: What each app owns, what they share, and how to decide where code goes.
---

# Web vs native

Web and native diverge often, so they are two apps at the top of the workspace. Each has its own pages and its own core. Shared HTML and features sit underneath both. The approach on both is [HTML first](/docs/html-first).

## Why they diverge

Web and native run on different form factors, and they handle flows and interactions in different ways. Neither platform has one right way to build a UI, and a layout or flow that suits one is often not the best choice on the other.

Keeping them as separate apps is a strength. Each app can design its pages and flows for its own platform, instead of settling for one UI that is only passable on both. The parts that are the same everywhere, such as content, HTML features and design tokens, are written once in `packages/shared`. The parts that differ live in the app that owns them. Shared code then needs no platform checks, which is why `packages/shared` has no platform imports.

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
| CSS `px` | A CSS pixel | A CSS pixel on MasonKit elements, a device pixel on core NativeScript views |
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

`packages/ui/native` holds the glue helm needs on NativeScript, and `provideSpartanNativeScript()` installs it. The native app renders these docs pages, and each `html live` demo is compiled on the device against the same helm components the web uses. Overlays open in native windows instead of a CDK overlay:

- A dialog or alert dialog opens in a full-screen, transparent modal window. On iOS it uses the `overFullScreen` presentation.
- A sheet or drawer on the bottom edge opens in a native bottom sheet from `@nativescript-community/ui-bottomsheet`, sized to its content.
- A sheet or drawer on the left, right or top edge docks to that edge in the app's `Drawer` from `@nativescript-community/ui-drawer`.
- A popover opens in an anchored window from `@nativescript-community/ui-popover`. Select, combobox, autocomplete and date picker use the same window.
- A dropdown menu opens the platform menu from `@nativescript-community/ui-menu`. That is a Material 3 popup menu on Android and a `UIMenu` on iOS.

[Native status](/docs/components#native-status) records what each component's demo did on an Android emulator (API 36, x86_64), in light and dark. These results have not been checked on iOS yet.

## Known native limitations

These apply across components.

- **Helm rules beat utilities on helm hosts.** helm's `.style-vega .spartan-*` rules have a specificity of 0,2,0 and sit outside any layer, so they override a Tailwind utility you put on the same element. For example, `h-12` or `rounded-full` on `hlmBtn`, or `gap-*` and `p-*` on `hlmCard`, have no effect. This happens on the web too. A fix is planned.
- **Opacity-modified token colours.** Classes such as `bg-input/80`, `bg-destructive/10` and `dark:bg-input/30` keep the plain light token colour on native, in every theme.
- **Text layout in MasonKit.** A button does not center its text. A text element with `display: flex` does not center its text, so avatar initials sit in the top left. A text element nested inside another text element drops the styling of its inline children. Text ignores `white-space: pre`, so code blocks render as plain text.
- **Browser APIs in brain components.** Some brain components call browser APIs that do not exist on NativeScript, and throw. MasonKit elements have no `getBoundingClientRect()`, which breaks the select and the slider. There is no `document.defaultView`, which breaks the tooltip. The NativeScript document has no `createElement()`, so a CDK overlay cannot be created, which breaks the hover card.
- **Media queries.** NativeScript drops media queries. `apps/native/src/app.css` overrides the `motion-safe` variant so that the spinner and skeleton animations run.
- **Links inside a live demo.** An `<a href>` with an app path inside a live demo does nothing when tapped. Links in the docs Markdown use `/docs/:slug`, and the native app serves those pages at the same path.
- **Hover.** A touch screen has no hover, and the tooltip and the hover card open on hover.