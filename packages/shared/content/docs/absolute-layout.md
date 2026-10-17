---
title: AbsoluteLayout
section: Layouts
order: 15
description: Children positioned by left and top.
---

# AbsoluteLayout

`<AbsoluteLayout>` positions every child with `left` and `top`. The layout is `position: relative` and each child is `position: absolute`.

| Attribute | On | Meaning |
| --- | --- | --- |
| `left` | child | Offset from the left edge. A bare number is pixels. Default `0`. |
| `top` | child | Offset from the top edge. Default `0`. |

The container has no intrinsic height because all children are out of flow, so give it one.

```html live
<AbsoluteLayout class="rounded border" style="height: 160px">
  <div left="10" top="10" class="p-2 rounded bg-primary text-primary-foreground">10, 10</div>
  <div left="120" top="50" class="p-2 rounded bg-secondary text-secondary-foreground">120, 50</div>
  <div left="40" top="100" class="p-2 rounded bg-accent text-accent-foreground">40, 100</div>
</AbsoluteLayout>
```