---
title: Components overview
section: Components
order: 20
description: Spartan helm components with live examples, and how each one runs on native.
---

# Components

These pages show the [Spartan](https://spartan.ng) **helm** components that live in `packages/ui/helm`. They are the forward way to build UI in this project: plain HTML elements and attributes, styled with Tailwind classes and the shared theme tokens.

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
| [Select](/docs/ui-select) | `hlm-select` and its parts |
| [Slider](/docs/ui-slider) | `hlm-slider` |
| [Popover](/docs/ui-popover) | `hlm-popover` and its parts |
| [Dropdown menu](/docs/ui-dropdown-menu) | `hlmDropdownMenuTrigger`, `hlm-dropdown-menu` and its parts |
| [Sheet](/docs/ui-sheet) | `hlm-sheet` and its parts |
| [Drawer](/docs/ui-drawer) | `hlm-drawer` and its parts |
| [Table](/docs/ui-table) | `hlmTable` and its parts |
| [Calendar](/docs/ui-calendar) | `hlm-calendar`, `hlm-calendar-multi`, `hlm-calendar-range` |
| [Tooltip](/docs/ui-tooltip) | `hlmTooltip` |
| [More components](/docs/ui-more) | toggle, toggle group, collapsible, hover card, kbd, spinner, breadcrumb, native select, alert dialog |

## Native status

The native app renders these pages too, and compiles each demo on the device against the same helm components. Each page ends with a Native note that says what was seen on an Android emulator (API 36), in light and dark. This table sums them up. These results have not been checked on iOS yet.

| Component | Android | Notes |
| --- | --- | --- |
| [Button](/docs/ui-button) | Works | `a hlmBtn` text sits at the top of the button. |
| [Badge](/docs/ui-badge) | Works | |
| [Card](/docs/ui-card) | Works | No ring or shadow is drawn. |
| [Form controls](/docs/ui-form-controls) | Works | The textarea has no inner padding. A radio item selects only from its circle. |
| [Tabs](/docs/ui-tabs) | Works | The `line` variant draws no underline. |
| [Dialog](/docs/ui-dialog) | Works | Opens in a native modal window. |
| [Alert](/docs/ui-alert) | Works | |
| [Popover](/docs/ui-popover) | Works | Opens in a native popover window. |
| [Dropdown menu](/docs/ui-dropdown-menu) | Works | Opens the platform menu. No submenus, labels or separators yet. |
| [Sheet](/docs/ui-sheet) | Works | Bottom sheets open in a native bottom sheet, other sides in a side drawer. |
| [Drawer](/docs/ui-drawer) | Works | Opens in a native bottom sheet. |
| [Toggle, toggle group, collapsible, breadcrumb, alert dialog](/docs/ui-more) | Works | |
| [Separator](/docs/ui-feedback) | Works | |
| [Kbd and spinner](/docs/ui-more) | Partial | Render. The keys sit slightly above the baseline. |
| [Avatar](/docs/ui-feedback) | Partial | Initials sit in the top left. |
| [Progress and skeleton](/docs/ui-feedback) | Partial | The progress indicator and the skeleton blocks are not drawn. |
| [Table](/docs/ui-table) | Partial | The cells of each row stack vertically. |
| [Calendar](/docs/ui-calendar) | Partial | Only the first day of each week shows. |
| [Accordion](/docs/ui-accordion) | Broken | Renders an empty preview. |
| [Select](/docs/ui-select) | Broken | The list opens, but a tap on an item does nothing. |
| [Slider](/docs/ui-slider) | Broken | No thumbs, and the value does not change. |
| [Tooltip](/docs/ui-tooltip) | Broken | Throws, and a touch screen has no hover. |
| [Hover card and native select](/docs/ui-more) | Broken | The hover card throws on load. The native select opens nothing. |

Most of the gaps come from a few causes that affect every component. See [Known native limitations](/docs/web-vs-native#known-native-limitations).

## More in the workspace

`packages/ui/helm` holds further components, for example `carousel`, `chart`, `command`, `combobox`, `context-menu`, `date-picker`, `menubar` and `sidebar`. They have no page here yet. Pages are added only for components that have been rendered in this workspace. The `chart` component is used by the Charts and Chart gallery [examples](/docs/shared-features#larger-examples).

## Imports in your own code

In an app, import from the helm entry point for each component:

```ts
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
```
