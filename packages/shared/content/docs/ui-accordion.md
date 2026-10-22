---
title: Accordion
section: Components
order: 26
description: Collapsible sections with hlmAccordion.
---

# Accordion

## Basic

`hlm-accordion` holds `hlm-accordion-item` elements. Each item has a trigger and content.

```html live
<hlm-accordion type="single" class="max-w-md">
  <hlm-accordion-item>
    <hlm-accordion-trigger>Is it HTML first?</hlm-accordion-trigger>
    <hlm-accordion-content>Yes. Pages are plain HTML with attributes.</hlm-accordion-content>
  </hlm-accordion-item>
  <hlm-accordion-item>
    <hlm-accordion-trigger>Is it themed?</hlm-accordion-trigger>
    <hlm-accordion-content>It uses the shared cream and teal tokens.</hlm-accordion-content>
  </hlm-accordion-item>
</hlm-accordion>
```

`hlm-accordion` takes `type` and `orientation`. `hlm-accordion-item` takes `isOpened` and `disabled`, and emits `openedChange`.

## Native

The accordion is broken on native. On the Android emulator (API 36), the demo above renders an empty preview in light and dark. The brain trigger checks `tagName === 'BUTTON'`, MasonKit reports the tag name in lower case, and the check throws. iOS has not been run.