---
title: Alert
section: Components
order: 28
description: The hlmAlert directive with title and description parts.
---

# Alert

`hlmAlert` sets `role="alert"` on its element. It has `default` and `destructive` variants.

```html live
<div class="flex max-w-md flex-col gap-3">
  <div hlmAlert>
    <div hlmAlertTitle>Heads up</div>
    <p hlmAlertDescription>Alerts are plain elements with attributes.</p>
  </div>
  <div hlmAlert variant="destructive">
    <div hlmAlertTitle>Something went wrong</div>
    <p hlmAlertDescription>The destructive variant uses the destructive token.</p>
  </div>
</div>
```

There is also an `hlmAlertAction` part for a trailing action.
