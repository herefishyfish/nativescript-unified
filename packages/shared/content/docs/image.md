---
title: Image
section: Views
order: 21
description: Image with src and alt.
---

# Image

`<Image>` renders an `<img>`. It takes `src` and `alt`, and the image is capped at the width of its container.

```html live
<Image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='80'%3E%3Crect width='160' height='80' rx='10' fill='%2327695f'/%3E%3Ctext x='80' y='46' font-size='18' text-anchor='middle' fill='%23f2ebdd'%3EImage%3C/text%3E%3C/svg%3E" alt="Teal placeholder"></Image>
```

Nothing is rendered when `src` is empty.