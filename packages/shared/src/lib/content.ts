/** Content shared by the web and native apps. Plain data, no platform imports. */
export interface Feature { title: string; body: string }

export const FEATURES: readonly Feature[] = [
  { title: 'HTML first', body: 'Pages are written as plain HTML. The native app renders them through MasonKit, the web app renders them in the browser.' },
  { title: 'File based routing', body: 'Drop a *.page.ts into src/app/pages. The same convention works in AnalogJS and in @nativescript-unified/analog-native.' },
  { title: 'Spartan UI components', body: 'Buttons, cards, tabs, dialogs and more from Spartan helm, styled by the shared theme tokens.' },
];
