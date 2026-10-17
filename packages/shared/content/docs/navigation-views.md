---
title: Navigation views
section: Views
order: 27
description: ActionBar, NavigationButton, Tabs, Pager and Drawer, with iOS and Material approximations.
---

# Navigation views

These views are implemented by the polyfills. Four of them take `platform="ios"` or `platform="material"`, which restyles them as an approximation of the native look. The default is `default`.

## ActionBar

`title` is the bar title. `<NavigationButton text="Back">` is the back control. Other children go in the `leading` or `trailing` slot. `large` turns on the iOS large title.

```html live
<StackLayout class="gap-3">
  <ActionBar title="Inbox">
    <NavigationButton text="Back"></NavigationButton>
    <div slot="trailing" class="p-2">Edit</div>
  </ActionBar>
  <ActionBar title="Inbox" platform="ios"></ActionBar>
  <ActionBar title="Inbox" platform="material"></ActionBar>
</StackLayout>
```

## Tabs

Children are plain `<ns-tab label="...">` elements. `selectedIndex` picks the tab, and `segmented` makes the iOS look a segmented control.

```html live
<Tabs selectedIndex="1" class="rounded border">
  <ns-tab label="One">First tab content</ns-tab>
  <ns-tab label="Two">Second tab content</ns-tab>
  <ns-tab label="Three">Third tab content</ns-tab>
</Tabs>
```

## Pager

Children are `<ns-page>` elements. One shows at a time, with Prev and Next buttons and dots. There is no swipe or scroll snapping.

```html live
<Pager class="rounded border">
  <ns-page>Page one</ns-page>
  <ns-page>Page two</ns-page>
  <ns-page>Page three</ns-page>
</Pager>
```

## Drawer

The default content is the page, and `slot="drawer"` is the panel. `open` is a model, and `width` defaults to 280 pixels. The panel is positioned over the content, so give the drawer a height.

```html live
<Drawer #d class="rounded border" style="height: 200px" [width]="200">
  <div slot="drawer" class="p-3">
    <p>Drawer panel</p>
    <button hlmBtn variant="outline" (click)="d.open.set(false)">Close</button>
  </div>
  <div class="p-3">
    <button hlmBtn (click)="d.open.set(true)">Open drawer</button>
  </div>
</Drawer>
```

Tapping the scrim closes it too.

## Looks per platform

On `ios`, `Tabs` becomes a bottom bar and `Pager` shows only dots. On `material`, `ActionBar` uses the primary colour and `Drawer` has rounded end corners. These are CSS approximations, as described in [Polyfill limitations](/docs/polyfill-limitations).