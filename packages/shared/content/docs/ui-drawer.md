---
title: Drawer
section: Components
order: 35
description: A drawer that opens from the bottom edge by default, with a handle.
---

# Drawer

`hlm-drawer` has the same shape as the sheet. Its `direction` input defaults to `bottom` and also accepts `top`, `left` and `right`.

```html live
<hlm-drawer>
  <button hlmBtn hlmDrawerTrigger variant="outline">Open drawer</button>
  <hlm-drawer-content *hlmDrawerPortal="let ctx">
    <div hlmDrawerHeader>
      <h3 hlmDrawerTitle>Move goal</h3>
      <p hlmDrawerDescription>Set your daily activity goal.</p>
    </div>
    <div hlmDrawerFooter>
      <button hlmBtn (click)="ctx.close('submitted')">Submit</button>
      <button hlmBtn hlmDrawerClose variant="outline">Cancel</button>
    </div>
  </hlm-drawer-content>
</hlm-drawer>
```

Use the [Sheet](/docs/ui-sheet) for a side panel with a close button, and the drawer for a bottom panel with a drag handle.
