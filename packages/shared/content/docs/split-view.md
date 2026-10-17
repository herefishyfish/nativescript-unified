---
title: SplitView
section: Layouts
order: 16
description: Primary, supplementary, secondary and inspector columns.
---

# SplitView

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