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

Nothing on native uses the dialog yet, so this is planned. `packages/ui/native/ui/overlays.ts` contains native modal and sheet glue for overlays, but no native page exercises helm's dialog.