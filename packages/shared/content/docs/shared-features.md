---
title: Writing shared HTML features
section: HTML first
order: 13
description: Rules for components in packages/shared that render on web and native.
---

# Writing shared HTML features

A shared feature is an Angular component in `packages/shared` whose template works in a browser and under MasonKit.

## A real example

`packages/shared/src/lib/home/home-feature.component.ts`:

```ts
@Component({
  selector: 'app-home-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-feature.component.html',
})
export class HomeFeature {
  readonly features = FEATURES;
}
```

Its data comes from `packages/shared/src/lib/content.ts`, which is plain TypeScript with no platform imports. The package index re-exports both, so either app can `import { HomeFeature } from '@nativescript-unified/shared'`.

## Rules

- Use plain HTML elements: `div`, `p`, `h1` to `h6`, `ul`, `li`, `a`, `span`, `img`.
- Import nothing from `@analogjs/*` or `@nativescript/*` in `packages/shared`. Those belong to an app.
- Style with the token classes (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`). The tokens come from `packages/ui/styles/tokens.css`.
- Put loose text that sits beside elements inside `@for` or `@if` in a `<span>`. MasonKit places dynamically inserted text nodes after their element siblings, according to `analog-native`'s README.
- Prefer Tailwind classes for lengths. In a stylesheet, remember that `px` is a CSS pixel on MasonKit elements but a device pixel on core NativeScript views such as `Label` or `ActionBar`. The example stylesheets keep lengths out of CSS for that reason and hold only colours, gradients and weights.
- Prefer `OnPush` and signals. Both apps run zoneless.

## Control flow works

This demo uses `@for` over plain markup, the same way the shared feature does:

```html live
<div class="flex flex-col gap-2">
  @for (n of [1, 2, 3]; track n) {
    <div class="flex flex-col gap-1 p-3 rounded-lg bg-card text-card-foreground border">
      <h2 class="text-base font-semibold">Feature {{ n }}</h2>
      <p class="text-sm text-muted-foreground">Rendered from a loop with plain elements only.</p>
    </div>
  }
</div>
```

## Using it in each app

On web, import the component in a page and use its selector. On native, do the same inside a page that provides the `ActionBar` and `<scroll>`. See [Web vs native](/docs/web-vs-native).

## Larger examples

`packages/shared/src/lib/examples` holds twelve full screens built the same way: pricing, checkout, profile, analytics, settings, events, ratings, sign in, music player, article and two chart screens. Each is one component plus one stylesheet that sets its own palette (see [Scoped palettes](/docs/theming#scoped-palettes)). The [home page](/) of this site renders them live, and the native app opens them from its UI tab with Code and Styles tabs beside the preview.

## Tailwind on native

`apps/native` lists `@nativescript/tailwind` and `tailwindcss`, and its `app.css` imports Tailwind and the shared tokens, so the same classes style native. This was checked on an Android emulator (API 36). Two gaps remain. Opacity-modified token colours such as `bg-destructive/10` keep the plain light token colour, and helm's own rules can override a utility you put on a helm host. See [Known native limitations](/docs/web-vs-native#known-native-limitations).