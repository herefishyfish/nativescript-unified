---
title: DockLayout
section: Layouts
order: 14
description: Children docked to the edges.
---

# DockLayout

`<DockLayout>` docks children to the `top`, `right`, `bottom` or `left` edge.

| Attribute | On | Meaning |
| --- | --- | --- |
| `dock` | child | `top`, `bottom`, `left` or `right`. Anything else lands in the centre. |
| `stretchLastChild` | DockLayout | Default `true`: the last child fills the centre and its `dock` is ignored. |

The polyfill uses a three-by-three CSS grid with one cell per edge. Several children on the same edge share that cell.

```html live
<DockLayout class="gap-2" style="height: 220px">
  <div dock="top" class="p-2 rounded bg-primary text-primary-foreground">top</div>
  <div dock="bottom" class="p-2 rounded bg-secondary text-secondary-foreground">bottom</div>
  <div dock="left" class="p-2 rounded bg-accent text-accent-foreground">left</div>
  <div dock="right" class="p-2 rounded bg-accent text-accent-foreground">right</div>
  <div class="p-2 rounded border">last child stretches into the centre</div>
</DockLayout>
```