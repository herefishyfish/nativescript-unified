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
