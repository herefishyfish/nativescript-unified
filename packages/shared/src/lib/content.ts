/** Content shared by the web and native apps. Plain data, no platform imports. */
export interface Feature {
  title: string;
  body: string;
  /** Slug of the docs page that covers it. Both apps address that page at /docs/<slug>. */
  docs?: string;
}

export const FEATURES: readonly Feature[] = [
  { title: 'HTML first', body: 'Pages are written as plain HTML. The native app renders them through MasonKit, the web app renders them in the browser.', docs: 'html-first' },
  { title: 'Spartan UI components', body: 'Buttons, cards, tabs, dialogs and more from Spartan helm, styled by the shared theme tokens.', docs: 'components' },
  { title: 'File based routing', body: 'Drop a *.page.ts into src/app/pages. The same convention works in AnalogJS and in @nativescript-unified/analog-native.', docs: 'file-routing' },
  { title: 'One theme', body: 'Colour tokens live in one file. Both apps import it, and dark mode follows the same tokens on web and native.', docs: 'theming' },
  { title: 'Markdown with live demos', body: 'Docs are Markdown in packages/shared. Fenced html live blocks compile into running demos, in the browser and on the device.', docs: 'markdown-on-native' },
  { title: 'Legacy tags on the web', body: 'Existing StackLayout, GridLayout and Label markup still renders in a browser through the web polyfills.', docs: 'legacy-tags' },
];
