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

## Native

The default bottom drawer opens in a native bottom sheet from `@nativescript-community/ui-bottomsheet`. The sheet's window is transparent and sized to the content, so helm's drawer card and handle are what you see. Drawers in other directions open in the full-screen modal that dialogs use.

On the Android emulator (API 36), in light and dark, the drawer opened at its content height. Submit and Cancel closed it. In the overlays example, Submit returned `submitted`. Dragging the sheet down, a tap on the dimmed page and the Android back button each closed it with `undefined`. iOS has not been run.
