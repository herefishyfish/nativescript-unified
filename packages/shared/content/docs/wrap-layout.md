---
title: WrapLayout
section: Layouts
order: 13
description: Children wrap onto new lines.
---

# WrapLayout

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