# Native parity log

Where the native app falls behind the web docs, what was fixed on branch `native-parity`, and what is left.

Recorded 2026-10-29 on an Android emulator (API 36, 1080x2400) against the web docs at `apps/web` (all 49 pages render
every live demo with no console errors). Nothing here has been checked on iOS. Spartan's NativeScript demo
(`D:\Code\playgrounds\spartan\apps\native-demo`) was walked on the same emulator for comparison.

> The first version of this log was partly recorded against a stale JS bundle (an APK copied to a second emulator
> carried the previous day's bundle). Its controls-page crash and several other findings did not reproduce on the
> current build and are not listed below.

## Fixed on this branch

Each was checked on the emulator after the change.

| Area | Was | Cause | Fix |
| --- | --- | --- | --- |
| Utility classes in demos | `bg-primary` on a div, `grid-cols-[80px_1fr]`, `w-[90px]` had no effect | Tailwind on native never scanned the docs Markdown | `@source` the docs content in `apps/native/src/app.css` |
| Shadows and rings | Cards, popovers, menus had none; then `shadow-*` drew opaque black | The tailwind plugin deleted `--tw-ring-*`/`--tw-shadow*`; core's `var()` mis-parsed nested fallbacks and substituted `initial` | Keep the variables (tailwind patch); depth-matched `var()` fallbacks and `initial` as invalid (core patch); initial values for the layers (`native-overrides.css`) |
| Table | Cells stacked | MasonKit has no table elements | Block-backed `table`…`td`, rows as flex rows |
| Calendar | Tall blank block, one day visible, taps ignored, header `Thu Oct 01 2026` | `inline-flex` root laid out as a text run; full-width `aspect-square` cells; no full ICU | Overrides for the root and cells; English month names when `toLocaleDateString` ignores options |
| Select | Blank trigger, item taps ignored, `getBoundingClientRect` error | Value host is a block that draws no `textContent`; a MasonKit scroll box in a popover window swallows taps; trigger measured with a DOM call | Value hosts as text elements; panel sizes to its options and does not scroll; `injectElementSize` measures on `layoutChanged` |
| Native select | Options printed as text, no menu | No `select` element on native | `select`/`option` elements: the chosen option in a box, the platform menu on tap |
| Dropdown menu | No label or separators, shortcut glued to the label | Only items were passed to the platform menu | Sections, label headings, shortcut as subtitle, submenus |
| Tooltip, hover card | Threw on load | `document.defaultView` and CDK `Overlay.create` | No-DOM path: open on tap through the overlay host; popover windows keep the panel's width |
| Slider | No thumb or no value, range had no thumbs, demo threw | Brain needs DOM measurement and pointer events | A shim everywhere: MasonKit's `<input type="range">` for one value (the Material slider on the native-widget screens), a touch-driven helm range for two |
| ListPicker, ListView, Repeater | One entry per character | A string `items` was iterated | Comma-separated strings are split, as the web polyfills do |
| Markdown | No bullets, external links dead, `a hlmBtn` did not navigate | `li` and `a` are block-backed, without MasonKit's markers and link handling | The component draws markers; `HrefDirective` opens external URLs and is in the demo imports |
| navigation-views | The page blanked the whole app | Demos use the web polyfills' own markup | `html live web`: the app shows the code and a note |
| Label, image demos | Empty | `var()` in a colour attribute; an SVG `data:` URI | Classes on spans; a base64 PNG |
| Toasts | Not available | | Toast docs page; a native `hlm-toaster` shim |
| Native elements page | Plugin widgets only | | A Core views demo and a core-view column |
| Web | TOC links jumped to the home page; Progress and Slider polyfills unthemed | `<base href="/">`; `<Progress>` is the browser's `<progress>` | Path-qualified fragments; style the element itself |
| Native patches | Named for old versions; a partial apply was reported once, then hidden | | Regenerated for the installed versions; applied hunk by hunk with the patch hash in the marker |

## Still open

| Area | What happens | Notes |
| --- | --- | --- |
| Progress | The indicator is sized (65%) but its fill is not painted | The view has the right `backgroundColor`; a literal colour or `bg-red-500` on it paints, `.spartan-progress-indicator`'s `var(--primary)` does not. Not found yet. |
| Legacy layouts | GridLayout and DockLayout ignore `height` and collapse their `*` row; AbsoluteLayout and SplitView show one child; horizontal StackLayout stretches its first child; FlexboxLayout ignores `flexGrow` | NativeScript's own views inside MasonKit containers. The HTML-first versions on the same pages work. |
| ScrollView (legacy) | The vertical one overflows its box and does not scroll; the horizontal one shows slivers | Same cause as above |
| `-order-1` | Ignored | Tailwind emits `order: calc(1 * -1)` |
| Text runs | A trailing space inside `<strong>` is dropped ("Boldand") | The MasonKit whitespace patch trims it |
| Markdown | Wrapped inline code overlaps the line above; HtmlView `<li>` has no space after the bullet; tables scroll sideways with no cue; an anchor lands its heading mid-screen | |
| Select | The list does not scroll | Trade-off of the tap fix above |
| Table | `colspan` is ignored | Cells take equal shares |
| Overlays example | Outline buttons' text sits top left until the first overlay closes; the service dialog runs full width | First-layout issue |
| Tabs, toggle, collapsible, sheet | The tab panel shifts down on switch; toggle and collapsible triggers stretch full width; a side sheet covers the status bar and its input touches the edge | |
| App | Relaunching after Back exits shows a blank screen; Back after the link button returns to the Components list | |
| Console | `NG0912` component ID collision for `HlmSwitch` at launch | The spartan and native switch share a selector |
| iOS | Nothing checked | |

## Compared with Spartan's native demo

Spartan's `apps/native-demo` copies helm's markup into each demo and opens overlays through an app-level service;
this repository runs the real brain and helm components through native overlay and menu hosts, which kept dismissal
rules, results and ARIA state, and avoided bugs Spartan's copies have (typing that comes out reversed, a submenu
that hangs the app, sheets that do not open on two sides, dark mode that does not invert primaries).

Taken from it: platform menus for native select, the width-not-transform technique (slider range), touch-opened
tooltips and hover cards, and a toast stack. Its select failed the same way ours did, which pointed at taps inside
popover windows. Not taken: its carousel (`ui-pager`, skipped), chart (`ui-chart`; ours keeps helm's API), the
date-picker dialog and context menu (no docs pages here yet), and haptics through a plugin (ours use the platform
APIs directly).
