---
title: Toast
section: Components
order: 39
description: Short messages that appear at the edge of the screen and close themselves.
---

# Toast

Put one `hlm-toaster` in the app, then call `toast()` from `@spartan-ng/brain/sonner` anywhere. A toast has a title and can take a `description`, a `type` (`success`, `info`, `warning`, `error`, `loading`), an `action` and a `duration` in milliseconds.

```html live
<div class="flex flex-wrap gap-2">
  <button hlmBtn variant="outline" (click)="toast('Event created', { description: 'Sunday, December 3 at 9:00' })">Show toast</button>
  <button hlmBtn variant="outline" (click)="toast.success('Saved')">Success</button>
  <button
    hlmBtn
    variant="outline"
    (click)="toast('Message archived', { action: { label: 'Undo', onClick: toast.dismiss } })"
  >
    With action
  </button>
</div>
<hlm-toaster />
```

```ts
import { toast } from '@spartan-ng/brain/sonner';

toast('Event created', { description: 'Sunday, December 3 at 9:00' });
toast.success('Saved');
```

## On native

The native app has its own `hlm-toaster` (`packages/ui/native/shims/helm-sonner.ts`), which `apps/native/vite.config.mts` resolves for every import of `@spartan-ng/helm/sonner`. It draws the same `toast()` state as a stack of cards where the toaster sits in the layout, so give it a place at the bottom of a screen. When several are on screen, only the oldest draws. Tap a toast to close it. Swiping, the close button and the theme and position options are web only.
