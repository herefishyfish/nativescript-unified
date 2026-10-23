---
title: Dialog
section: Components
order: 27
description: A modal dialog with a trigger, header, footer and close buttons.
---

# Dialog

`hlm-dialog` wraps a trigger button and a `hlm-dialog-content` panel. The panel is declared with `*hlmDialogPortal`, so it is only created when the dialog opens.

```html live
<hlm-dialog>
  <button hlmBtn hlmDialogTrigger variant="outline">Open dialog</button>
  <hlm-dialog-content *hlmDialogPortal="let ctx">
    <hlm-dialog-header>
      <h3 hlmDialogTitle>Edit profile</h3>
      <p hlmDialogDescription>Make changes to your profile, then save.</p>
    </hlm-dialog-header>
    <div class="flex flex-col gap-1.5 py-2">
      <label hlmLabel for="dialog-name">Name</label>
      <input hlmInput id="dialog-name" placeholder="Dylan" />
    </div>
    <hlm-dialog-footer>
      <button hlmBtn variant="outline" hlmDialogClose>Cancel</button>
      <button hlmBtn hlmDialogClose>Save</button>
    </hlm-dialog-footer>
  </hlm-dialog-content>
</hlm-dialog>
```

The dialog is built on the brain dialog and the Angular CDK overlay. It closes with Escape, with a `hlmDialogClose` button, or with the built-in close button.

## Native

The same markup opens a native modal window. `provideSpartanNativeScript()` swaps the CDK dialog for the NativeScript overlay host, so the app needs no other setup.

These results were checked on the Android emulator (API 36), in light and dark:

- The window is full screen and transparent. The helm card and helm's overlay class are the only chrome, so the dialog looks as it does on the web, without the blur.
- Close and Cancel return `saved` and `cancelled` through `closed`. `HlmDialogService.open()` returns its result the same way.
- The Android back button closes the dialog, and the result is `undefined`.
- A tap outside the card closes the dialog. A tap inside the card does not. The alert dialog ignores a tap outside, and the back button still closes it.
- The live example on this page opens the native dialog.

On iOS the same window uses the `overFullScreen` presentation.