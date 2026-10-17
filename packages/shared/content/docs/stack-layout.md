---
title: StackLayout
section: Layouts
order: 10
description: Children in a single row or column.
---

# StackLayout

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