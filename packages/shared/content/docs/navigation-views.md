---
title: Navigation views
section: App structure
order: 18
description: ActionBar, bottom navigation, tabs, Drawer and Pager, the native views that move between screens.
---

# Navigation views

The bar across the top of a screen, the tabs along the bottom and the drawer at the side are native views on a device. They are app structure, not legacy markup, so an HTML-first app keeps them, and its HTML pages render inside them. On the web, the `web-polyfills` package draws approximations of the same tags, so a template that uses them still renders in a browser.

## On a device

| View | Comes from | In this app |
| --- | --- | --- |
| `ActionBar`, `NavigationButton`, `ActionItem` | `@nativescript/core`, through `ActionBarComponent` from `@nativescript/angular` | Routed pages import `ActionBarComponent` to show their own title |
| `BottomNavigation` | `@nativescript-community/ui-bottom-navigation` | The home screen's Guide, Components and UI tabs |
| `Tabs` | `@nativescript-community/ui-tabs` | Registered, not used on a screen yet |
| `Drawer` | `@nativescript-community/ui-drawer` | Wraps the app in `app.component.ts`. Side sheets open in it. |
| `Pager` | A plugin such as `@nativescript-community/ui-pager` | Not installed |

`apps/native/src/main.ts` registers the plugin views with `registerElement()`. The home screen, `apps/native/src/app/pages/index.page.ts`, is a `BottomNavigation` with one `TabStripItem` per tab and one `TabContentItem` per screen. Trimmed, it reads:

```html
<ActionBar title="NativeScript Unified" />
<BottomNavigation selectedIndex="0">
  <TabStrip>
    <TabStripItem><Label text="Guide"></Label></TabStripItem>
    <TabStripItem><Label text="Components"></Label></TabStripItem>
    <TabStripItem><Label text="UI"></Label></TabStripItem>
  </TabStrip>
  <TabContentItem><guide-list kind="guide" /></TabContentItem>
  <TabContentItem><guide-list kind="components" /></TabContentItem>
  <TabContentItem><ui-demo /></TabContentItem>
</BottomNavigation>
```

## On the web

A browser has none of these views, so the polyfills draw them with CSS. The demos below use the polyfills' own markup (`ns-tab`, `ns-page`, slots) rather than the plugins' child elements, so the native app shows their code only. `ActionBar`, `Tabs`, `Pager` and `Drawer` take `platform="ios"` or `platform="material"`, which restyles them as an approximation of the native look. The default is `default`.

### ActionBar

`title` is the bar title. `<NavigationButton text="Back">` is the back control. Other children go in the `leading` or `trailing` slot. `large` turns on the iOS large title.

```html live web
<StackLayout class="gap-3">
  <ActionBar title="Inbox">
    <NavigationButton text="Back"></NavigationButton>
    <div slot="trailing" class="p-2">Edit</div>
  </ActionBar>
  <ActionBar title="Inbox" platform="ios"></ActionBar>
  <ActionBar title="Inbox" platform="material"></ActionBar>
</StackLayout>
```

### Tabs

Children are plain `<ns-tab label="...">` elements. `selectedIndex` picks the tab, and `segmented` makes the iOS look a segmented control.

```html live web
<Tabs selectedIndex="1" class="rounded border">
  <ns-tab label="One">First tab content</ns-tab>
  <ns-tab label="Two">Second tab content</ns-tab>
  <ns-tab label="Three">Third tab content</ns-tab>
</Tabs>
```

### Pager

Children are `<ns-page>` elements. One shows at a time, with Prev and Next buttons and dots. There is no swipe or scroll snapping.

```html live web
<Pager class="rounded border">
  <ns-page>Page one</ns-page>
  <ns-page>Page two</ns-page>
  <ns-page>Page three</ns-page>
</Pager>
```

### Drawer

The default content is the page, and `slot="drawer"` is the panel. `open` is a model, and `width` defaults to 280 pixels. The panel is positioned over the content, so give the drawer a height.

```html live web
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

### Looks per platform

On `ios`, `Tabs` becomes a bottom bar and `Pager` shows only dots. On `material`, `ActionBar` uses the primary colour and `Drawer` has rounded end corners. These are CSS approximations, as described in [Polyfill limitations](/docs/polyfill-limitations).

## Inside a page

For tabs inside a page, use helm [Tabs](/docs/ui-tabs). For a side panel, use the [Sheet](/docs/ui-sheet), and for a bottom panel, the [Drawer](/docs/ui-drawer). The workspace also has helm `sidebar` and `navigation-menu` folders in `packages/ui/helm`, which have no pages here yet. The web app builds its own app-level navigation, such as this site's header and sidebar. See [Web vs native](/docs/web-vs-native).
