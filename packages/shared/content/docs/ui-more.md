---
title: More components
section: Components
order: 39
description: Toggle, toggle group, collapsible, hover card, kbd, spinner, breadcrumb, native select and alert dialog.
---

# More components

Smaller helm components that render on the web in this workspace.

## Toggle and toggle group

```html live
<div class="flex flex-col gap-3">
  <button hlmToggle aria-label="Bold" variant="outline">Bold</button>
  <div hlmToggleGroup type="single" variant="outline">
    <button hlmToggleGroupItem value="left" aria-label="Left">Left</button>
    <button hlmToggleGroupItem value="center" aria-label="Center">Center</button>
    <button hlmToggleGroupItem value="right" aria-label="Right">Right</button>
  </div>
</div>
```

## Collapsible

`hlmCollapsible` takes `expanded` and emits `expandedChange`.

```html live
<div hlmCollapsible class="flex max-w-sm flex-col gap-2">
  <button hlmBtn hlmCollapsibleTrigger variant="outline">Toggle details</button>
  <div hlmCollapsibleContent class="text-sm">Hidden until the trigger is pressed.</div>
</div>
```

## Hover card

```html live
<div hlmHoverCard>
  <button hlmBtn variant="link" hlmHoverCardTrigger [showDelay]="0">@nativescript</button>
  <hlm-hover-card-content *hlmHoverCardPortal class="w-64">
    <p class="text-sm">Shown on hover or focus of the trigger.</p>
  </hlm-hover-card-content>
</div>
```

## Kbd and spinner

```html live
<div class="flex items-center gap-4">
  <span class="text-sm">Press <kbd hlmKbd>Ctrl</kbd> + <kbd hlmKbd>K</kbd></span>
  <hlm-spinner />
</div>
```

## Breadcrumb

```html live
<nav hlmBreadcrumb>
  <ol hlmBreadcrumbList>
    <li hlmBreadcrumbItem><span hlmBreadcrumbLink>Home</span></li>
    <li hlmBreadcrumbSeparator></li>
    <li hlmBreadcrumbItem><span hlmBreadcrumbLink>Components</span></li>
    <li hlmBreadcrumbSeparator></li>
    <li hlmBreadcrumbItem><span hlmBreadcrumbPage>More</span></li>
  </ol>
</nav>
```

## Native select

`hlm-native-select` styles the browser's own `<select>`.

```html live
<div class="flex flex-col gap-1.5">
  <label hlmLabel for="native-colour">Colour</label>
  <hlm-native-select selectId="native-colour">
    <option hlmNativeSelectOption value="teal">Teal</option>
    <option hlmNativeSelectOption value="cream">Cream</option>
  </hlm-native-select>
</div>
```

## Alert dialog

```html live
<hlm-alert-dialog>
  <button hlmBtn hlmAlertDialogTrigger variant="outline">Delete account</button>
  <hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx">
    <hlm-alert-dialog-header>
      <h3 hlmAlertDialogTitle>Are you sure?</h3>
      <p hlmAlertDialogDescription>This cannot be undone.</p>
    </hlm-alert-dialog-header>
    <hlm-alert-dialog-footer>
      <button hlmBtn hlmAlertDialogCancel variant="outline">Cancel</button>
      <button hlmBtn hlmAlertDialogAction (click)="ctx.close()">Continue</button>
    </hlm-alert-dialog-footer>
  </hlm-alert-dialog-content>
</hlm-alert-dialog>
```

## Native

Results on the Android emulator (API 36), in light and dark. These results have not been checked on iOS yet.

- **Toggle and toggle group:** work. A tap sets the pressed state.
- **Collapsible:** works. The trigger shows and hides the content.
- **Hover card:** broken. The trigger renders. When the page loads, the hover card content service creates a CDK overlay, which needs a DOM document, so it throws. A touch screen also has no hover.
- **Kbd and spinner:** render. The keys sit slightly above the text baseline.
- **Breadcrumb:** works.
- **Native select:** broken. The options render as stacked text that overflows the box, and a tap opens nothing. MasonKit rejects the `Canvas` and `CanvasText` system colours.
- **Alert dialog:** works. It opens in a native modal window, like the [Dialog](/docs/ui-dialog). A tap outside does not close it. Cancel, Continue and the Android back button do.
