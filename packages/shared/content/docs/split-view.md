---
title: SplitView
section: App structure
order: 17
description: A sidebar and a detail column side by side, the layout of tablet apps.
---

# SplitView

`<SplitView>` is NativeScript core's split layout: a sidebar beside a detail column, as in a tablet's mail or settings app. It is a native view, so an HTML-first app keeps using it on a device. On iOS it is a `UISplitViewController`, which shows its columns side by side on a wide screen and collapses them into one column on a phone. On Android it is a plain container.

Each child sets `splitRole` to say which column it fills:

| Attribute | On | Meaning |
| --- | --- | --- |
| `splitRole` | child | `primary`, `supplementary`, `secondary` or `inspector` |
| `preferredPrimaryColumnWidthFraction` | SplitView | The primary column's share of the width, from 0 to 1 |
| `preferredSupplementaryColumnWidthFraction`, `preferredInspectorColumnWidthFraction` | SplitView | The same for those columns, on iOS |
| `displayMode` | SplitView | How the columns sit, on iOS: `automatic`, `secondaryOnly`, `oneBesideSecondary`, `oneOverSecondary`, `twoBesideSecondary`, `twoOverSecondary` or `twoDisplaceSecondary` |
| `splitBehavior` | SplitView | `automatic`, `tile`, `overlay` or `displace`, on iOS |

From code, `showPrimary()` and `hidePrimary()` open and close the primary column, and each other role has the same pair.

## On the web

A browser has no split view controller, so the `web-polyfills` package draws `<SplitView>` as a CSS grid with one column per role present, in the order primary, supplementary, secondary, inspector. It reads `splitRole` (or `split-role`) and `preferredPrimaryColumnWidthFraction`. With no roles at all, it puts primary beside secondary, and children without a role fill columns by their position.

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

In the native app on Android, these demos show only one column, because SplitView is a plain container there.

In an HTML page, write the grid directly. With two roles and a 0.3 primary fraction, that is a two-column grid:

```html live
<div class="grid grid-cols-[30%_1fr] gap-2" style="height: 140px">
  <div class="p-2 rounded bg-primary text-primary-foreground">primary</div>
  <div class="p-2 rounded bg-secondary text-secondary-foreground">secondary</div>
</div>
```
