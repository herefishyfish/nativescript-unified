---
title: Dropdown menu
section: Components
order: 33
description: A menu opened from a button, with items, a label, shortcuts, a checkbox and a separator.
---

# Dropdown menu

The trigger is any element with `[hlmDropdownMenuTrigger]` set to a template reference. The menu itself is an `hlm-dropdown-menu` inside an `ng-template`.

```html live
<button hlmBtn variant="outline" [hlmDropdownMenuTrigger]="menu">Open menu</button>
<ng-template #menu>
  <hlm-dropdown-menu class="w-56">
    <hlm-dropdown-menu-label>My account</hlm-dropdown-menu-label>
    <hlm-dropdown-menu-separator />
    <hlm-dropdown-menu-group>
      <button hlmDropdownMenuItem>Profile <hlm-dropdown-menu-shortcut>Ctrl P</hlm-dropdown-menu-shortcut></button>
      <button hlmDropdownMenuItem>Settings</button>
    </hlm-dropdown-menu-group>
    <hlm-dropdown-menu-separator />
    <button hlmDropdownMenuItem variant="destructive">Log out</button>
  </hlm-dropdown-menu>
</ng-template>
```

Items take `variant="destructive"`, `disabled` and `inset`. The trigger takes `side` and `align`. Checkbox, radio and sub-menu parts also exist in `packages/ui/helm/dropdown-menu`.
## Native

The same markup opens the platform menu: a Material 3 popup menu on Android and a `UIMenu` on iOS, from `@nativescript-community/ui-menu`. `provideSpartanNativeScript()` provides the menu host. The trigger renders the menu template off screen and passes each item's text, disabled state, `variant="destructive"` and checked state to the platform menu. When you choose an item, `(triggered)` fires and checkboxes and radios toggle as they do on the web.

These results were checked on the Android emulator, in light and dark:

- The menu opens below its trigger with the theme's card surface.
- Profile, the Status bar checkbox and Log out reach the page. The checkbox shows its checked state, the disabled item is grey and ignores taps, and the destructive item is red.
- The Android back button closes the menu.

The native menu does not show submenus, labels, separators or shortcuts yet. Items with a submenu are left out. iOS has not been run on a device.
