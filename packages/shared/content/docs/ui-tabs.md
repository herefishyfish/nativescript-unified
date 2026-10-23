---
title: Tabs
section: Components
order: 25
description: Tabs built from hlmTabs, a list of triggers and matching content panels.
---

# Tabs

`hlmTabs` takes the id of the active tab in `tab`. Each `hlmTabsTrigger` and `hlmTabsContent` names the tab it belongs to.

```html live
<div hlmTabs tab="account" class="max-w-md">
  <div hlmTabsList>
    <button hlmTabsTrigger="account">Account</button>
    <button hlmTabsTrigger="password">Password</button>
  </div>
  <div hlmTabsContent="account">Make changes to your account here.</div>
  <div hlmTabsContent="password">Change your password here.</div>
</div>
```

## Line variant

`hlmTabsList` takes `variant="line"` for a transparent list with an underline on the active trigger.

```html live
<div hlmTabs tab="overview" class="max-w-md">
  <div hlmTabsList variant="line">
    <button hlmTabsTrigger="overview">Overview</button>
    <button hlmTabsTrigger="usage">Usage</button>
  </div>
  <div hlmTabsContent="overview">An overview panel.</div>
  <div hlmTabsContent="usage">A usage panel.</div>
</div>
```

`hlmTabs` also takes `orientation` and `activationMode`, and emits `tabActivated`.

For app-level navigation, see [Web vs native](/docs/web-vs-native).
