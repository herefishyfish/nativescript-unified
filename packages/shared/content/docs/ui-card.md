---
title: Card
section: Components
order: 23
description: hlmCard and its header, title, description, content and footer parts.
---

# Card

A card is a container with named parts. Import them all with `HlmCardImports`.

```html live
<section hlmCard class="max-w-sm">
  <div hlmCardHeader>
    <div hlmCardTitle>Vintage teal</div>
    <p hlmCardDescription>Cream and teal, from the shared theme tokens.</p>
  </div>
  <div hlmCardContent>
    <p class="text-sm">Cards are plain elements with attributes, so they are ordinary HTML in your template.</p>
  </div>
  <div hlmCardFooter class="gap-2">
    <button hlmBtn>Save</button>
    <button hlmBtn variant="outline">Cancel</button>
  </div>
</section>
```

The parts are `hlmCard`, `hlmCardHeader`, `hlmCardTitle`, `hlmCardDescription`, `hlmCardContent`, `hlmCardFooter` and `hlmCardAction`. `hlmCard` also takes a `size` input.

## Native

The card works on native. On the Android emulator (API 36), the header, title, description, content and footer render with their padding in light and dark, and the footer buttons respond to taps. These results have not been checked on iOS yet.

The card has no visible edge, because its ring and shadow are not drawn. It blends into a background of the same colour. Utilities such as `gap-*` or `p-*` on `hlmCard` have no effect, because helm's own rules win. See [Known native limitations](/docs/web-vs-native#known-native-limitations).