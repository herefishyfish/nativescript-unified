---
title: SplitView
section: Legacy NativeScript tags
order: 47
description: Primary, supplementary, secondary and inspector columns.
---

# SplitView

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [CSS grid](/docs/html-layout). See [Legacy NativeScript tags](/docs/legacy-tags).

`<SplitView>` is a column layout driven by roles. Each child sets `splitRole` to `primary`, `supplementary`, `secondary` or `inspector`.

| Attribute | On | Meaning |
| --- | --- | --- |
| `splitRole` | child | Which column the child sits in. `split-role` also works. |
| `preferredPrimaryColumnWidthFraction` | SplitView | A number from 0 to 1 for the primary column. The other columns share what remains. |

Columns follow the roles that are actually present, in the order primary, supplementary, secondary, inspector. With no roles at all it is primary beside secondary, and children without a role fill columns by their position.

```html live
<SplitView preferredPrimaryColumnWidthFraction="0.3" class="gap-2" style="height: 140px">
  <div splitRole="primary" class="p-2 rounded bg-primary text-primary-foreground">primary</div>
  <div splitRole="secondary" class="p-2 rounded bg-secondary text-secondary-foreground">secondary</div>
</SplitView>
```

```html live
<SplitView class="gap-2" style="height: 140px">
  <div splitRole="primary" class="p-2 rounded bg-primary text-primary-foreground">primary</div>
  <div splitRole="supplementary" class="p-2 rounded bg-muted text-muted-foreground">supplementary</div>
  <div splitRole="secondary" class="p-2 rounded bg-secondary text-secondary-foreground">secondary</div>
</SplitView>
```

The polyfill maps it to a CSS grid with one column per present role.

## HTML-first equivalent

The polyfill is a CSS grid with one column per present role. With two roles and a 0.3 primary fraction, the HTML version is a two-column grid:

```html live
<div class="grid grid-cols-[30%_1fr] gap-2" style="height: 140px">
  <div class="p-2 rounded bg-primary text-primary-foreground">primary</div>
  <div class="p-2 rounded bg-secondary text-secondary-foreground">secondary</div>
</div>
```