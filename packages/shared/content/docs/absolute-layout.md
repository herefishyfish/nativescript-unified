---
title: AbsoluteLayout
section: Legacy NativeScript tags
order: 46
description: Children positioned by left and top.
---

# AbsoluteLayout

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [relative and absolute positioning](/docs/html-layout). See [Legacy NativeScript tags](/docs/legacy-tags).

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

## HTML-first equivalent

The polyfill sets the container to `position: relative` and each child to `position: absolute`. That is `relative` on the container and `absolute` plus `left-*` and `top-*` on the children:

```html live
<div class="relative rounded border" style="height: 160px">
  <div class="absolute left-[10px] top-[10px] p-2 rounded bg-primary text-primary-foreground">10, 10</div>
  <div class="absolute left-[120px] top-[50px] p-2 rounded bg-secondary text-secondary-foreground">120, 50</div>
  <div class="absolute left-[40px] top-[100px] p-2 rounded bg-accent text-accent-foreground">40, 100</div>
</div>
```