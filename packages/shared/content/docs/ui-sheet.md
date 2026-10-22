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

A sheet with `side="bottom"` opens in a native bottom sheet. You can drag it down to close it. Native platforms have no side panel window, so the other sides open in a centered native modal. The Android back button closes the sheet in both cases.
