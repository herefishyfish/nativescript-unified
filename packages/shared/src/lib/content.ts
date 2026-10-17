/** Content shared by the web and native apps. Plain data, no platform imports. */
export interface Feature { title: string; body: string }

export const FEATURES: readonly Feature[] = [
  { title: 'HTML first', body: 'Pages are written as plain HTML. The native app renders them through MasonKit, the web app renders them in the browser.' },
  { title: 'File based routing', body: 'Drop a *.page.ts into src/app/pages. The same convention works in AnalogJS and in @nativescript-unified/analog-native.' },
  { title: 'Legacy layouts still work', body: 'Need a <StackLayout> or <GridLayout> on the web? The web polyfills render the tree as-is.' },
];
