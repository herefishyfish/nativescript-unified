---
title: FAQ
section: Getting started
order: 5
description: Short answers, each checked against the workspace.
---

# FAQ

## Which platforms does it run on?

The web, iOS and Android are the main targets. The same NativeScript app also runs on macOS and Windows, which are not the main focus. The native app renders these docs pages with their live demos on the device. The component results in [Native status](/docs/components#native-status) were recorded on an Android emulator (API 36). See [Installation](/docs/installation) and [Web vs native](/docs/web-vs-native).

## Why are web and native separate apps?

Web and native run on different form factors and handle flows and interactions differently. Each app designs its pages and flows for its own platform, and shared HTML sits underneath both. See [Why they diverge](/docs/web-vs-native#why-they-diverge).

## Why not use the AnalogJS packages on native?

According to `docs/design.md`: the AnalogJS router calls plain `provideRouter`, so it misses the NativeScript location strategy and `RouterExtensions`. AnalogJS content renders to an HTML string that a native view cannot show. And adding `@analogjs/platform` would register the Angular compiler twice and pull in Nitro and SSR. Native keeps Analog's file conventions with its own implementation.

## Can I write `<StackLayout>` on the web?

Yes, if you import the component, but it is legacy support for existing NativeScript markup. New code should use HTML. See [HTML first](/docs/html-first), [StackLayout](/docs/stack-layout) and [Polyfill limitations](/docs/polyfill-limitations).

## Why are the polyfills not custom elements?

A custom element name needs a hyphen, and `StackLayout` has none.

## Can I use `<Button>` or `<TextField>`?

Not through the polyfills. Use HTML elements or Spartan. On a device `<Button>` is MasonKit's button. NativeScript's core Button stays available as `<NButton>`. See [Button](/docs/ui-button), [Form controls](/docs/ui-form-controls) and [Button and TextField](/docs/button-and-text-field).

## Can a demo react to input?

Yes. A demo is a real Angular template, so a template reference gives you the component instance. Toggle this switch:

```html live
<div class="flex flex-row items-center gap-3">
  <hlm-switch #sw aria-label="Demo switch" />
  <span class="text-sm">{{ sw.checked() ? 'On' : 'Off' }}</span>
</div>
```

## Does `px` mean the same thing on native?

On MasonKit elements, yes: `px` is a CSS pixel, the same size as a NativeScript dip, and `rem`, `em`, `vw`, `vh` and `calc()` resolve as they do in a browser. On core NativeScript views such as `Label` or `ActionBar`, `px` is a device pixel. A bare number means a dip on both. See [Writing shared HTML features](/docs/shared-features).

## How do I add a docs page?

Add a `.md` file to `packages/shared/content/docs`. The slug is the file name. Front matter has `title`, `section`, `order` and `description`. Pages sort by `order`, then by title, and sections appear in the order of their first page. A fenced block tagged `html live` is both shown and rendered as a demo. Both apps pick the file up: the web prerenders it at `/docs/<slug>`, and the native app lists it on its Guide or Components tab.

## Is the site prerendered?

Yes. `nx build web` writes static HTML for the home page and every docs page. Demos compile in the browser, and the Angular compiler loads on demand.

## Where do the colours come from?

`packages/ui/styles/tokens.css`. The hex values are estimates inspired by a shoe, not sampled. See [Theming](/docs/theming).

## Can I rename the package scope?

The scope `@nativescript-unified` is a placeholder. Renaming means changing the package names and the `paths` in `tsconfig.base.json`.