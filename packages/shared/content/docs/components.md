---
title: Components overview
section: Components
order: 20
description: Spartan helm components with live examples, and how each one runs on native.
---

# Components

These pages show the Spartan **helm** components that live in `packages/ui/helm`. They are the forward way to build UI in this project: plain HTML elements and attributes, styled with Tailwind classes and the shared theme tokens.

Every example is a real Angular template. The code in the Code tab is the code that renders in the Preview tab, compiled at run time against the helm components from this workspace. That happens in your browser on the web, and on the device in the native app.

## How helm works

Helm components are mostly attribute directives and small components on top of headless **brain** primitives. You add an attribute to an element you already know:

```html live
<button hlmBtn variant="outline">A button element with the hlmBtn attribute</button>
```

Variants, such as `variant="outline"`, are inputs on the directive. Colours come from the tokens in `packages/ui/styles/tokens.css`, so every component follows [Theming](/docs/theming) and dark mode.

## Pages

| Page | Components |
| --- | --- |
| [Button](/docs/ui-button) | `hlmBtn` |
| [Badge](/docs/ui-badge) | `hlmBadge` |
| [Card](/docs/ui-card) | `hlmCard` and its parts |
| [Form controls](/docs/ui-form-controls) | `hlmInput`, `hlmLabel`, `hlmTextarea`, `hlm-checkbox`, `hlm-switch`, `hlm-radio-group` |
| [Tabs](/docs/ui-tabs) | `hlmTabs` and its parts |
| [Accordion](/docs/ui-accordion) | `hlmAccordion` and its parts |
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

## More in the workspace

`packages/ui/helm` holds further components, for example `carousel`, `chart`, `command`, `combobox`, `context-menu`, `menubar` and `sidebar`. They have no page here yet. Pages are added only for components that have been rendered in this workspace.

## Native availability

The native app renders these pages too, and compiles each demo on the device against the same helm components. Each page ends with a Native note that says what was seen on an Android emulator (API 36), in light and dark. iOS has not been run.

| Status on Android | Pages |
| --- | --- |
| Works | [Button](/docs/ui-button), [Badge](/docs/ui-badge), [Card](/docs/ui-card), [Form controls](/docs/ui-form-controls), [Tabs](/docs/ui-tabs), [Dialog](/docs/ui-dialog), [Alert](/docs/ui-alert), [Popover](/docs/ui-popover), [Dropdown menu](/docs/ui-dropdown-menu), [Drawer](/docs/ui-drawer) |
| Renders with large gaps | [Table](/docs/ui-table), [Calendar](/docs/ui-calendar), progress and skeleton on [Progress, skeleton, avatar and separator](/docs/ui-feedback) |
| Broken | [Accordion](/docs/ui-accordion), [Select](/docs/ui-select), [Slider](/docs/ui-slider), [Tooltip](/docs/ui-tooltip), and the hover card and native select on [More components](/docs/ui-more) |

Pages that work can still have small visual gaps, which their Native notes list. The [Sheet](/docs/ui-sheet) page has its own note. For limits that affect every component, see [Web vs native](/docs/web-vs-native).

## Imports in your own code

In an app, import from the helm entry point for each component:

```ts
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
```