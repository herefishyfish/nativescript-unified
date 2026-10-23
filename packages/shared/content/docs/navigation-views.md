---
title: Navigation views
section: Legacy NativeScript tags
order: 55
description: ActionBar, NavigationButton, Tabs, Pager and Drawer, with iOS and Material approximations.
---

# Navigation views

> [!NOTE]
> **Legacy support.** This page documents a NativeScript tag that the web polyfills implement so existing NativeScript markup renders in a browser. For new code, use [helm tabs](/docs/ui-tabs) and [dialog](/docs/ui-dialog). See [Legacy NativeScript tags](/docs/legacy-tags).

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

## HTML-first equivalent

For in-page tabs, use helm [Tabs](/docs/ui-tabs). For a side panel, use the [Sheet](/docs/ui-sheet), and for a bottom panel, the [Drawer](/docs/ui-drawer). The workspace also has helm `sidebar` and `navigation-menu` folders in `packages/ui/helm`, which have no pages here yet.

On native, the example app uses the real `ActionBar` from `@nativescript/angular` and real bottom tabs from `@nativescript-community/ui-bottom-navigation`, so those are not things you replace there. See [Web vs native](/docs/web-vs-native).