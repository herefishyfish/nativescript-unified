---
title: Sheet
section: Components
order: 34
description: A panel that slides in from an edge of the screen.
---

# Sheet

`hlm-sheet` works like the dialog: a trigger button and an `hlm-sheet-content` declared with `*hlmSheetPortal`. `side` picks the edge: `top`, `bottom`, `left` or `right`. The brain sheet defaults to `top`.

```html live
<hlm-sheet side="right">
  <button hlmBtn hlmSheetTrigger variant="outline">Open sheet</button>
  <hlm-sheet-content *hlmSheetPortal="let ctx">
    <div hlmSheetHeader>
      <h3 hlmSheetTitle>Edit profile</h3>
      <p hlmSheetDescription>Make changes to your profile here.</p>
    </div>
    <div class="flex flex-col gap-1.5 px-4">
      <label hlmLabel for="sheet-name">Name</label>
      <input hlmInput id="sheet-name" placeholder="Dylan" />
    </div>
    <div hlmSheetFooter>
      <button hlmBtn hlmSheetClose>Save changes</button>
    </div>
  </hlm-sheet-content>
</hlm-sheet>
```

`hlm-sheet-content` shows a close button unless `showCloseButton` is false. Escape also closes it.

## Native

A sheet with `side="bottom"` opens in a native bottom sheet from `@nativescript-community/ui-bottomsheet`, the same window as the drawer. The other sides open in a side of the app's `Drawer` from `@nativescript-community/ui-drawer`, which slides the sheet in from its edge over a `bg-black/10` backdrop.

On the Android emulator (API 36), left, right and top sheets docked to their edge and slid in, in light and dark. A left or right sheet took three quarters of the screen width and the full height. A top sheet took the full width and the height of its content. The sheet's background ran under the status and navigation bars, and its content stayed clear of them. Apply returned `applied`. A backdrop tap and the Android back button closed the sheet. A backdrop tap left the sheet open when `closeOnOutsidePointerEvents` was false. A text input in the sheet took keyboard input. These results have not been checked on iOS yet.
