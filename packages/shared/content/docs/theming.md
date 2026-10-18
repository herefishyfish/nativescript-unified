---
title: Theming
section: Guides
order: 30
description: Colour tokens, dark mode and the NativeScript polyfill variables.
---

# Theming

All colours come from one file: `packages/ui/styles/tokens.css`. It uses shadcn-style names (`--background`, `--foreground`, `--primary`, and so on) with plain hex values, because NativeScript CSS has no `oklch`.

The palette is inspired by the New Balance Numeric Jamie Foy 306 in "Sea Salt / Vintage Teal": a warm cream background, a deep teal-black foreground and a vintage teal accent. The hex values are estimates, not sampled from the shoe.

| Token | Light | Dark |
| --- | --- | --- |
| `--background` | `#f2ebdd` | `#0b2423` |
| `--foreground` | `#10302f` | `#f2ebdd` |
| `--primary` | `#3e8e84` | `#5fb3a8` |
| `--secondary`, `--muted` | `#e3d9c4` | `#1a403e` |
| `--accent` | `#cfe2dd` | `#1f4c49` |
| `--border` | `#d3c7ad` | `#25504d` |

```html live
<WrapLayout itemWidth="120" itemHeight="56" class="gap-2">
  <div class="p-2 rounded border bg-background text-foreground">background</div>
  <div class="p-2 rounded bg-primary text-primary-foreground">primary</div>
  <div class="p-2 rounded bg-secondary text-secondary-foreground">secondary</div>
  <div class="p-2 rounded bg-accent text-accent-foreground">accent</div>
  <div class="p-2 rounded bg-muted text-muted-foreground">muted</div>
  <div class="p-2 rounded bg-card text-card-foreground border">card</div>
</WrapLayout>
```

## Dark mode

On the web, dark mode is the `dark` class on `<html>`. Use the toggle in the top bar. Your choice is stored in `localStorage` under `ns-unified-theme`. An inline script in `index.html` applies it before first paint, and the first visit follows the operating system setting. On native the equivalent is the `ns-dark` class on the root view, and `.ns-light` is the light counterpart. The native `app.css` imports `tokens.css`.

## Polyfill variables

The web polyfills read `--ns-*` variables (`--ns-foreground`, `--ns-primary`, `--ns-card`, `--ns-border`, `--ns-radius`, and so on). `tokens.css` maps them onto the theme tokens, so switching to dark mode restyles polyfilled views as well.

## Using the tokens

In Tailwind classes, use the token names: `bg-background`, `text-foreground`, `bg-primary text-primary-foreground`, `border`. The Spartan `helm` components read the same tokens.