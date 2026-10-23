---
title: Theming
section: HTML first
order: 12
description: Colour tokens, dark mode, scoped palettes and the NativeScript polyfill variables.
---

# Theming

All colours come from one file: `packages/ui/styles/tokens.css`. It uses shadcn-style names (`--background`, `--foreground`, `--primary`, and so on) with plain hex values, because NativeScript CSS has no `oklch`. Both apps import it, so the web and the device share one palette.

The palette is inspired by the New Balance Numeric Jamie Foy 306 in "Sea Salt / Vintage Teal": a warm cream background, a deep teal-black foreground and a vintage teal accent. The hex values are estimates, not sampled from the shoe.

| Token | Light | Dark |
| --- | --- | --- |
| `--background` | `#f2ebdd` | `#171a18` |
| `--foreground` | `#10302f` | `#f2ebdd` |
| `--primary` | `#27695f` | `#5ea396` |
| `--secondary`, `--muted` | `#e3d9c4` | `#2b2d27` |
| `--accent` | `#cfe2dd` | `#27403b` |
| `--border` | `#d3c7ad` | `#3a3b33` |

```html live
<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
  <div class="p-3 rounded border bg-background text-foreground">background</div>
  <div class="p-3 rounded bg-primary text-primary-foreground">primary</div>
  <div class="p-3 rounded bg-secondary text-secondary-foreground">secondary</div>
  <div class="p-3 rounded bg-accent text-accent-foreground">accent</div>
  <div class="p-3 rounded bg-muted text-muted-foreground">muted</div>
  <div class="p-3 rounded border bg-card text-card-foreground">card</div>
</div>
```

## Using the tokens

In Tailwind classes, use the token names: `bg-background`, `text-foreground`, `bg-primary text-primary-foreground`, `border`. The Spartan `helm` components read the same tokens, so they follow the theme and dark mode without any extra setup.

## Dark mode

On the web, dark mode is the `dark` class on `<html>`. Use the toggle in the top bar. Your choice is stored in `localStorage` under `ns-unified-theme`. An inline script in `index.html` applies it before first paint, and the first visit follows the operating system setting.

On native the equivalent is the `ns-dark` class on the root view, and `.ns-light` is the light counterpart. NativeScript sets it from the system theme. The native `app.css` imports `tokens.css` and maps Tailwind's `dark:` variant onto `.ns-dark`.

## Scoped palettes

The utilities read the tokens where they are used, so redefining a token on an element re-themes everything inside it, helm components included:

```html live
<div class="flex flex-col gap-3 p-4 rounded-lg bg-background text-foreground" style="--background: #fff6f2; --foreground: #3d1f17; --primary: #b84a30; --primary-foreground: #ffffff; --secondary: #fde2d8; --secondary-foreground: #3d1f17; --border: #fbe0d6">
  <p class="font-semibold">A warmer palette, scoped to this box</p>
  <div class="flex flex-row flex-wrap gap-2">
    <button hlmBtn>Primary</button>
    <button hlmBtn variant="secondary">Secondary</button>
    <span hlmBadge>Badge</span>
  </div>
</div>
```

Every [example screen](/docs/shared-features#larger-examples) in `packages/shared` works this way. Its stylesheet redefines the tokens on `.example-<slug>`, with a dark set under `.dark .example-<slug>` and `.ns-dark .example-<slug>`. Only colours change, and `--radius` stays shared.

## Polyfill variables

The legacy web polyfills read `--ns-*` variables (`--ns-foreground`, `--ns-primary`, `--ns-card`, `--ns-border`, `--ns-radius`, and so on). `tokens.css` maps them onto the theme tokens, so switching to dark mode restyles polyfilled views as well.
