---
title: WrapLayout
section: Legacy NativeScript tags
order: 44
description: Children wrap onto new lines.
---

# WrapLayout

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [flex wrap](/docs/html-layout). See [Legacy NativeScript tags](/docs/legacy-tags).

`<WrapLayout>` is a wrapping flex container. Children flow along the `orientation` and wrap when they run out of room.

| Attribute | Values | Result |
| --- | --- | --- |
| `orientation` | `horizontal` (default), `vertical` | `flex-direction: row` or `column`, with `flex-wrap: wrap` |
| `itemWidth` | number or length | `width` set on every direct child |
| `itemHeight` | number or length | `height` set on every direct child |

A bare number means pixels. `px`, `%` and `dip` are also accepted.

```html live
<WrapLayout itemWidth="90" itemHeight="48" class="gap-2">
  <div class="rounded bg-primary text-primary-foreground p-2">1</div>
  <div class="rounded bg-secondary text-secondary-foreground p-2">2</div>
  <div class="rounded bg-accent text-accent-foreground p-2">3</div>
  <div class="rounded bg-primary text-primary-foreground p-2">4</div>
  <div class="rounded bg-secondary text-secondary-foreground p-2">5</div>
  <div class="rounded bg-accent text-accent-foreground p-2">6</div>
  <div class="rounded bg-primary text-primary-foreground p-2">7</div>
  <div class="rounded bg-secondary text-secondary-foreground p-2">8</div>
</WrapLayout>
```

## HTML-first equivalent

The polyfill is a flex container with `flex-wrap: wrap`. In HTML that is `flex flex-wrap`. `itemWidth` and `itemHeight` become a width and height on each child:

```html live
<div class="flex flex-wrap gap-2">
  <div class="w-[90px] h-12 rounded bg-primary text-primary-foreground p-2">1</div>
  <div class="w-[90px] h-12 rounded bg-secondary text-secondary-foreground p-2">2</div>
  <div class="w-[90px] h-12 rounded bg-accent text-accent-foreground p-2">3</div>
  <div class="w-[90px] h-12 rounded bg-primary text-primary-foreground p-2">4</div>
  <div class="w-[90px] h-12 rounded bg-secondary text-secondary-foreground p-2">5</div>
  <div class="w-[90px] h-12 rounded bg-accent text-accent-foreground p-2">6</div>
</div>
```