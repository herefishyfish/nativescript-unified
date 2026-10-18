---
title: StackLayout
section: Legacy NativeScript tags
order: 41
description: Children in a single row or column.
---

# StackLayout

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [flex containers](/docs/html-layout). See [Legacy NativeScript tags](/docs/legacy-tags).

`<StackLayout>` arranges its children in one line. On the web it becomes a flex container.

| Attribute | Values | Result |
| --- | --- | --- |
| `orientation` | `vertical` (default), `horizontal` | `flex-direction: column` or `row` |

## Vertical (default)

```html live
<StackLayout class="gap-2">
  <div class="p-3 rounded bg-primary text-primary-foreground">One</div>
  <div class="p-3 rounded bg-secondary text-secondary-foreground">Two</div>
  <div class="p-3 rounded bg-accent text-accent-foreground">Three</div>
</StackLayout>
```

## Horizontal

```html live
<StackLayout orientation="horizontal" class="gap-2">
  <div class="p-3 rounded bg-primary text-primary-foreground">One</div>
  <div class="p-3 rounded bg-secondary text-secondary-foreground">Two</div>
  <div class="p-3 rounded bg-accent text-accent-foreground">Three</div>
</StackLayout>
```

The polyfill writes `display` and `flex-direction` onto the element and re-applies them when the attribute changes.

## HTML-first equivalent

`<StackLayout>` is a flex container, so a plain `div` with flex classes does the same job:

```html live
<div class="flex flex-row gap-2">
  <div class="p-3 rounded bg-primary text-primary-foreground">One</div>
  <div class="p-3 rounded bg-secondary text-secondary-foreground">Two</div>
  <div class="p-3 rounded bg-accent text-accent-foreground">Three</div>
</div>
```

Use `flex flex-col` for the default vertical orientation. See [Layout with flex and grid](/docs/html-layout).