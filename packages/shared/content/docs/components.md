---
title: Components overview
section: Components
order: 20
description: Spartan helm components with live examples, on the web today and on native as it lands.
---

# Components

These pages show the Spartan **helm** components that live in `packages/ui/helm`. They are the forward way to build UI in this project: plain HTML elements and attributes, styled with Tailwind classes and the shared theme tokens.

Every example is a real Angular template. The code in the Code tab is the code that renders in the Preview tab, compiled in your browser against the helm components from this workspace.

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

## More in the workspace

`packages/ui/helm` holds many more components, for example `select`, `slider`, `popover`, `dropdown-menu`, `sheet`, `drawer`, `table`, `calendar` and `tooltip`. They have no page here yet. Pages are added only for components that have been rendered in this workspace.

## Native availability

Each page ends with a Native note. It says what the code shows today. The short version: the native app (`apps/native`) imports `HlmButton`, `HlmBadge` and the card parts on its `/ui` page, and `packages/ui/native` carries the glue helm needs on NativeScript. That page has been type-checked and bundled. It has not been confirmed on a device in these docs, and everything else is marked planned.

## Imports in your own code

In an app, import from the helm entry point for each component. This is the import used by `apps/native/src/app/pages/ui.page.ts`:

```ts
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
```