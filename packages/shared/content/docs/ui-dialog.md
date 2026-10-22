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

The same markup opens a native modal window. The window holds the helm content, styled by the same classes. `provideSpartanNativeScript()` swaps the CDK dialog for the NativeScript overlay host, so the app needs no other setup.

- The Android back button closes the dialog, unless `disableClose` is set.
- A tap outside closes it when `closeOnOutsidePointerEvents` is on, which is the default.
- `closed` and `HlmDialogService.open()` return the result as on the web.
- The native window dims the page, so helm's overlay element is not drawn.