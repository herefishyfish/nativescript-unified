# @nativescript-unified/web-polyfills

Angular components that implement NativeScript view tags on the web, so a legacy
`<StackLayout>` / `<GridLayout>` / `<Label>` tree renders in a browser.

Ported from `angular-docs` (`origin/main`, `packages/libraries/ui`). Brand, WebGPU hero
and docs-only pieces were dropped; only the polyfill code and its tests remain.

Layouts: StackLayout, GridLayout, WrapLayout, AbsoluteLayout, DockLayout, FlexboxLayout, SplitView.
Views: Label (+ FormattedString/Span), Image, ScrollView, ContentView, ActivityIndicator, Progress, Switch,
Slider, SearchBar, SegmentedBar, ListPicker, DatePicker, TimePicker, HtmlView, ListView, Repeater, WebView,
Placeholder, ActionBar, Tabs, Pager, Drawer.

Import the component you use (selector = NativeScript tag name):

```ts
import { NsStackLayout, NsLabel } from '@nativescript-unified/web-polyfills';
```

Test: `npx nx test web-polyfills`
