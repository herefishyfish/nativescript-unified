---
title: FAQ
section: Guides
order: 61
description: Short answers, each checked against the workspace.
---

# FAQ

## Does the native app run on a device?

It has been type-checked with `tsc` only. It has not been built or run on a device or emulator in this workspace. See [Installation](/docs/installation).

## Why are web and native separate apps?

They diverge often, so each owns its pages and core, and shared HTML sits underneath. See [Web vs native](/docs/web-vs-native).

## Why not use the AnalogJS packages on native?

According to `docs/design.md`: the AnalogJS router calls plain `provideRouter`, so it misses the NativeScript location strategy and `RouterExtensions`. AnalogJS content renders to an HTML string that a native view cannot show. And adding `@analogjs/platform` would register the Angular compiler twice and pull in Nitro and SSR. Native keeps Analog's file conventions with its own implementation.

## Can I write `<StackLayout>` on the web?

Yes, if you import the component, but it is legacy support for existing NativeScript markup. New code should use HTML. See [HTML first](/docs/html-first), [StackLayout](/docs/stack-layout) and [Polyfill limitations](/docs/polyfill-limitations).

## Why are the polyfills not custom elements?

A custom element name needs a hyphen, and `StackLayout` has none.

## Can I use `<Button>` or `<TextField>`?

Not through the polyfills. Use HTML elements or Spartan. On a device `<Button>` is MasonKit's button. NativeScript's core Button stays available as `<NButton>`. See [Button](/docs/ui-button), [Form controls](/docs/ui-form-controls) and [Button and TextField](/docs/button-and-text-field).

## Can a demo react to input?

Yes. A demo is a real Angular template, so a template reference on a polyfill gives you its instance. Toggle this switch:

```html live
<StackLayout orientation="horizontal" class="items-center gap-3">
  <Switch #sw></Switch>
  <Label [text]="sw.checked() ? 'On' : 'Off'"></Label>
</StackLayout>
```

## How do I add a docs page?

Add a `.md` file to `packages/shared/content/docs`. The slug is the file name. Front matter has `title`, `section`, `order` and `description`. Pages sort by `order`, then by title, and sections appear in the order of their first page. A fenced block tagged `html live` is both shown and rendered as a demo.

## Is the site prerendered?

Yes. `nx build web` writes static HTML for the home page and every docs page. Demos compile in the browser, and the Angular compiler loads on demand.

## Where do the colours come from?

`packages/ui/styles/tokens.css`. The hex values are estimates inspired by a shoe, not sampled. See [Theming](/docs/theming).

## Can I rename the package scope?

The scope `@nativescript-unified` is a placeholder. Renaming means changing the package names and the `paths` in `tsconfig.base.json`.