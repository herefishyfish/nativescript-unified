---
title: Layout with flex and grid
section: HTML first
order: 11
description: Rows, columns, grids, wrapping and positioning with plain HTML and Tailwind.
---

# Layout with flex and grid

Layout is CSS. Use `flex` for one dimension and `grid` for two.

## Row and column

```html live
<div class="flex flex-col gap-3">
  <div class="flex flex-row gap-2">
    <div class="p-3 rounded bg-primary text-primary-foreground">One</div>
    <div class="p-3 rounded bg-secondary text-secondary-foreground">Two</div>
    <div class="p-3 rounded bg-accent text-accent-foreground">Three</div>
  </div>
  <div class="flex flex-col gap-2">
    <div class="p-3 rounded bg-primary text-primary-foreground">Stacked one</div>
    <div class="p-3 rounded bg-secondary text-secondary-foreground">Stacked two</div>
  </div>
</div>
```

## Distribute and grow

`justify-*` spreads children along the main axis, `items-*` aligns them across it, and `grow` lets a child take the remaining space.

```html live
<div class="flex items-center justify-between gap-2 p-2 rounded border" style="height: 96px">
  <div class="p-3 rounded bg-primary text-primary-foreground">A</div>
  <div class="grow p-3 rounded bg-secondary text-secondary-foreground">B grows</div>
  <div class="p-3 rounded bg-accent text-accent-foreground">C</div>
</div>
```

## Wrapping

```html live
<div class="flex flex-wrap gap-2">
  <div class="w-24 p-2 rounded bg-primary text-primary-foreground">1</div>
  <div class="w-24 p-2 rounded bg-secondary text-secondary-foreground">2</div>
  <div class="w-24 p-2 rounded bg-accent text-accent-foreground">3</div>
  <div class="w-24 p-2 rounded bg-primary text-primary-foreground">4</div>
  <div class="w-24 p-2 rounded bg-secondary text-secondary-foreground">5</div>
  <div class="w-24 p-2 rounded bg-accent text-accent-foreground">6</div>
</div>
```

## Grid

```html live
<div class="grid grid-cols-3 gap-2">
  <div class="col-span-3 p-2 rounded bg-primary text-primary-foreground">Header</div>
  <div class="p-2 rounded bg-secondary text-secondary-foreground">Side</div>
  <div class="col-span-2 p-2 rounded bg-accent text-accent-foreground">Content</div>
</div>
```

## Positioning

A `relative` container with `absolute` children, positioned with `left-*` and `top-*`:

```html live
<div class="relative rounded border" style="height: 100px">
  <div class="absolute left-2 top-2 p-2 rounded bg-primary text-primary-foreground">top left</div>
  <div class="absolute bottom-2 right-2 p-2 rounded bg-secondary text-secondary-foreground">bottom right</div>
</div>
```

## On native

On a device, Mason, MasonKit's layout engine, lays out the same elements with CSS flex, grid, block flow and positioning, so the classes above mean the same thing there. Lengths on MasonKit elements follow the web too: `px` is a CSS pixel, and `rem`, `%` and `calc()` resolve. See [Writing shared HTML features](/docs/shared-features) for the rules shared templates follow.

If you have existing `<StackLayout>` or `<GridLayout>` markup, see [Legacy NativeScript tags](/docs/legacy-tags).