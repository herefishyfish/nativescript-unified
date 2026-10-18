---
title: DockLayout
section: Legacy NativeScript tags
order: 45
description: Children docked to the edges.
---

# DockLayout

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [CSS grid](/docs/html-layout). See [Legacy NativeScript tags](/docs/legacy-tags).

`<DockLayout>` docks children to the `top`, `right`, `bottom` or `left` edge.

| Attribute | On | Meaning |
| --- | --- | --- |
| `dock` | child | `top`, `bottom`, `left` or `right`. Anything else lands in the centre. |
| `stretchLastChild` | DockLayout | Default `true`: the last child fills the centre and its `dock` is ignored. |

The polyfill uses a CSS grid with columns `auto 1fr auto` and rows `auto 1fr auto`. `top` and `bottom` children span all three columns, `left` and `right` sit in the middle row, and the centre is the middle cell. Several children on the same edge share that cell.

```html live
<DockLayout class="gap-2" style="height: 220px">
  <div dock="top" class="p-2 rounded bg-primary text-primary-foreground">top</div>
  <div dock="bottom" class="p-2 rounded bg-secondary text-secondary-foreground">bottom</div>
  <div dock="left" class="p-2 rounded bg-accent text-accent-foreground">left</div>
  <div dock="right" class="p-2 rounded bg-accent text-accent-foreground">right</div>
  <div class="p-2 rounded border">last child stretches into the centre</div>
</DockLayout>
```

## HTML-first equivalent

The polyfill is already a CSS grid with columns `auto 1fr auto` and rows `auto 1fr auto`. Write that grid directly, and let top and bottom children span all three columns:

```html live
<div class="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-2" style="height: 220px">
  <div class="col-span-3 p-2 rounded bg-primary text-primary-foreground">top</div>
  <div class="p-2 rounded bg-accent text-accent-foreground">left</div>
  <div class="p-2 rounded border">centre</div>
  <div class="p-2 rounded bg-accent text-accent-foreground">right</div>
  <div class="col-span-3 p-2 rounded bg-secondary text-secondary-foreground">bottom</div>
</div>
```