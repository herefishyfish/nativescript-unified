---
title: More components
section: Components
order: 40
description: Toggle, toggle group, collapsible, hover card, kbd, spinner, breadcrumb, native select and alert dialog.
---

# More components

Smaller helm components, one demo each. They all work in the native app too. See [Native status](/docs/components#native-status).

## Toggle and toggle group

`hlmToggle` is a button with an on and off `state`. `hlmToggleGroup` holds `hlmToggleGroupItem` buttons and takes `type` (`single` or `multiple`) and `value`.

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

`hlmHoverCard` opens its content while the pointer is over the trigger or the trigger has focus. `showDelay` and `hideDelay` on the trigger are in milliseconds. In the native app, a tap opens it.

```html live
<div hlmHoverCard>
  <button hlmBtn variant="link" hlmHoverCardTrigger [showDelay]="0">@nativescript</button>
  <hlm-hover-card-content *hlmHoverCardPortal class="w-64">
    <p class="text-sm">Shown on hover or focus of the trigger.</p>
  </hlm-hover-card-content>
</div>
```

## Kbd and spinner

`hlmKbd` styles a key. `hlm-spinner` is a loading indicator.

```html live
<div class="flex items-center gap-4">
  <span class="text-sm">Press <kbd hlmKbd>Ctrl</kbd> + <kbd hlmKbd>K</kbd></span>
  <hlm-spinner />
</div>
```

## Breadcrumb

The breadcrumb parts are attributes on `nav`, `ol` and `li`. `hlmBreadcrumbLink` marks a link, and `hlmBreadcrumbPage` marks the current page.

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

`hlm-alert-dialog` asks the user to confirm an action. It has the `alertdialog` role, and a click outside does not close it.

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
