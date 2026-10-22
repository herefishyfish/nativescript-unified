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

`packages/ui/native` holds the glue helm needs on NativeScript, and `provideSpartanNativeScript()` installs it. The native app renders these docs pages, and each `html live` demo is compiled on the device against the same helm components the web uses. The results below come from an Android emulator (API 36, x86_64), in light and dark. iOS has not been run.

Each component page ends with a Native note that says what works there. In short:

- **Work:** button, badge, card, alert, tabs, form controls, dialog, alert dialog, drawer, popover, dropdown menu, toggle, toggle group, collapsible, breadcrumb and separator. Some of them have visual gaps.
- **Render with large gaps:** table, calendar, progress and skeleton.
- **Broken:** accordion, select, slider, tooltip, hover card and native select.

See [Components](/docs/components).

## Known native limitations

These apply across components. A component's Native note links here when one of them shows up in its demo.

- **Helm rules beat utilities on helm hosts.** helm's `.style-vega .spartan-*` rules have a specificity of 0,2,0 and sit outside any layer, so they override a Tailwind utility you put on the same element. For example, `h-12` or `rounded-full` on `hlmBtn`, or `gap-*` and `p-*` on `hlmCard`, have no effect. This happens on the web too. A fix is planned.
- **Opacity-modified token colours.** Classes such as `bg-input/80`, `bg-destructive/10` and `dark:bg-input/30` keep the plain light token colour on native, in every theme.
- **Text layout in MasonKit.** A button does not center its text. A text element with `display: flex` does not center its text, so avatar initials sit in the top left. A text element nested inside another text element drops the styling of its inline children. Text ignores `white-space: pre`, so code blocks render as plain text.
- **Browser APIs in brain components.** Some brain components call browser APIs that do not exist on NativeScript, and throw. MasonKit elements have no `getBoundingClientRect()`, which breaks the select and the slider. There is no `document.defaultView`, which breaks the tooltip. The NativeScript document has no `createElement()`, so a CDK overlay cannot be created, which breaks the hover card.
- **Links between docs pages.** The native app serves these pages at `/guide/:slug`, but the Markdown links point at `/docs/:slug`. On native, a tap on a link to another docs page opens the Not found page. An `<a href>` with an app path inside a live demo does nothing when tapped.
- **Hover.** A touch screen has no hover, and the tooltip and the hover card open on hover.