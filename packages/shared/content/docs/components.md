---
title: Components overview
section: Components
order: 20
description: Spartan helm components with live examples, and how each one runs on native.
---

# Components

These pages show the [Spartan](https://spartan.ng) **helm** components that live in `packages/ui/helm`. Build new UI with them. They are plain HTML elements and attributes, styled with Tailwind classes and the shared theme tokens.

Every example is a real Angular template. The code in the Code tab is the code that renders in the Preview tab, compiled at run time against the helm components in this workspace. That happens in your browser on the web, and on the device in the native app.

## How it works

Spartan has two layers, and both live in `packages/ui`:

| Layer | Import | What it does |
| --- | --- | --- |
| **brain** | `@spartan-ng/brain/*` | Headless primitives. They handle ARIA attributes, keyboard navigation, focus and open and closed state, and render no styles. |
| **helm** | `@spartan-ng/helm/*` | Styled directives and small components on top of brain, written with Tailwind classes that read the theme tokens. |

You mostly use helm. A helm component is usually an attribute on an element you already know:

```html
<button hlmBtn variant="outline">A button element with the hlmBtn attribute</button>
```

Variants, such as `variant="outline"`, are inputs on the directive. Colours come from the tokens in `packages/ui/styles/tokens.css`, so every component follows [Theming](/docs/theming) and dark mode. Both layers are consumed from source, so you can read and change any component in `packages/ui`.

## Pages

| Page | Components |
| --- | --- |
| [Button](/docs/ui-button) | `hlmBtn` |
| [Badge](/docs/ui-badge) | `hlmBadge` |
| [Card](/docs/ui-card) | `hlmCard` and its parts |
| [Form controls](/docs/ui-form-controls) | `hlmInput`, `hlmLabel`, `hlmTextarea`, `hlm-checkbox`, `hlm-switch`, `hlm-radio-group` |
| [Tabs](/docs/ui-tabs) | `hlmTabs` and its parts |
| [Accordion](/docs/ui-accordion) | `hlm-accordion` and its parts |
| [Dialog](/docs/ui-dialog) | `hlm-dialog` and its parts |
| [Alert](/docs/ui-alert) | `hlmAlert` |
| [Progress, skeleton, avatar and separator](/docs/ui-feedback) | `hlm-progress`, `hlmSkeleton`, `hlm-avatar`, `hlmSeparator` |
| [Picker](/docs/ui-picker) | `hlm-picker` |
| [Select](/docs/ui-select) | `hlm-select` and its parts |
| [Slider](/docs/ui-slider) | `hlm-slider` |
| [Popover](/docs/ui-popover) | `hlm-popover` and its parts |
| [Dropdown menu](/docs/ui-dropdown-menu) | `hlmDropdownMenuTrigger`, `hlm-dropdown-menu` and its parts |
| [Sheet](/docs/ui-sheet) | `hlm-sheet` and its parts |
| [Drawer](/docs/ui-drawer) | `hlm-drawer` and its parts |
| [Table](/docs/ui-table) | `hlmTable` and its parts |
| [Calendar](/docs/ui-calendar) | `hlm-calendar`, `hlm-calendar-multi`, `hlm-calendar-range` |
| [Tooltip](/docs/ui-tooltip) | `hlmTooltip` |
| [Toast](/docs/ui-sonner) | `hlm-toaster` and `toast()` |
| [More components](/docs/ui-more) | toggle, toggle group, collapsible, hover card, kbd, spinner, breadcrumb, native select, alert dialog |

## Native status

The native app renders these pages too, and compiles each demo on the device against the same helm components. This table records what each demo does there.

| Component | Android | Notes |
| --- | --- | --- |
| [Button](/docs/ui-button) | Works | A link styled as a button navigates. |
| [Badge](/docs/ui-badge) | Works | |
| [Card](/docs/ui-card) | Works | Ring and shadow are drawn. |
| [Form controls](/docs/ui-form-controls) | Works | |
| [Tabs](/docs/ui-tabs) | Works | |
| [Accordion](/docs/ui-accordion) | Works | |
| [Dialog](/docs/ui-dialog) | Works | Opens as the platform's dialog. See [Native elements](/docs/native-elements#dialogs). |
| [Alert](/docs/ui-alert) | Works | |
| [Picker](/docs/ui-picker) | Works | Opens full screen with `ModalDialogService`. The list scrolls under the search field. |
| [Select](/docs/ui-select) | Works | Opens in a native popover window. The list does not scroll, so a long list runs to the window's edge. |
| [Slider](/docs/ui-slider) | Works | One value is Material's slider (UISlider on iOS). A range is helm's track and thumbs, moved by touch. Keyboard steps are web only. |
| [Popover](/docs/ui-popover) | Works | Opens in a native popover window. |
| [Dropdown menu](/docs/ui-dropdown-menu) | Works | Opens the platform menu, with labels, separators, shortcuts and submenus. |
| [Sheet](/docs/ui-sheet) | Works | Bottom sheets open in a native bottom sheet, other sides in a side drawer. |
| [Drawer](/docs/ui-drawer) | Works | Opens in a native bottom sheet. |
| [Table](/docs/ui-table) | Works | `colspan` is ignored: each cell takes an equal share of its row. |
| [Calendar](/docs/ui-calendar) | Works | |
| [Tooltip](/docs/ui-tooltip) | Works | Opens on a tap or long press and closes itself. There is no arrow. |
| [Toast](/docs/ui-sonner) | Works | A native toaster draws the toasts where it sits in the layout. |
| [Toggle, toggle group, collapsible, breadcrumb, alert dialog, kbd, spinner](/docs/ui-more) | Works | The alert dialog opens as the platform's dialog. See [Native elements](/docs/native-elements#dialogs). |
| [Hover card](/docs/ui-more) | Works | Opens on a tap instead of a hover. |
| [Native select](/docs/ui-more) | Works | Opens the platform menu. |
| [Separator, avatar, skeleton](/docs/ui-feedback) | Works | |
| [Progress](/docs/ui-feedback) | Partial | The indicator is sized but its fill is not painted. |

The pages under NativeScript views are web polyfills of NativeScript's own views. On a device those tags are NativeScript's real views, so their demos can look different there, and a demo written in markup only the polyfills understand shows its code only. A few causes affect every component on native. See [Known native limitations](/docs/web-vs-native#known-native-limitations).

## More in the workspace

`packages/ui/helm` holds more components than these pages cover, for example `carousel`, `chart`, `command`, `combobox`, `context-menu`, `date-picker`, `menubar` and `sidebar`. The [Spartan docs](https://spartan.ng) describe them. The Charts and Chart gallery [examples](/docs/shared-features#larger-examples) use `chart`.

## Imports in your own code

In an app, import from the helm entry point for each component:

```ts
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
```
