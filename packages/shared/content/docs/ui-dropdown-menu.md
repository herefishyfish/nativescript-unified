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

## On native

The menu opens as a platform menu (`packages/ui/native/ui/menu-host.ts`). On Android it is a popup drawn like helm's menu, with `rounded-md` corners, 40dp rows of 15sp text sized for touch, and a `border` line between sections. Each time it opens, it reads `--popover`, `--popover-foreground`, `--muted-foreground`, `--accent`, `--border` and `--destructive` from the trigger, so a theme change or a scoped token override applies to it. A pressed item turns `--accent`, and a checked item shows a check at its end. The `class` on `hlm-dropdown-menu`, such as `w-56`, is web only: the popup sizes to its widest item. On iOS it is a `UIMenu` in the system's own style.
