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

Nothing on native uses the dropdown menu yet, so this is planned. `apps/native` imports only `HlmButton`, `HlmBadge` and the card parts.
