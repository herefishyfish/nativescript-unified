import { EnvironmentProviders, Injector, provideEnvironmentInitializer } from '@angular/core';
import { NsActionBar, NsNavigationButton } from '../action-bar/action-bar';
import { NsDrawer } from '../drawer/drawer';
import { NsAbsoluteLayout, NsDockLayout, NsFlexboxLayout, NsGridLayout, NsSplitView, NsStackLayout, NsWrapLayout } from '../layouts/layouts';
import { NsPager } from '../pager/pager';
import { NsTabs } from '../tabs/tabs';
import { NsActivityIndicator, NsImage, NsLabel, NsListPicker, NsProgress, NsScrollView, NsSearchBar, NsSegmentedBar, NsSlider, NsSwitch } from '../views/core-views';
import { NsContentView, NsDatePicker, NsHtmlView, NsListView, NsRepeater, NsTimePicker, NsWebView } from '../views/extra-views';
import { NsPlaceholder } from '../views/placeholder-view';
import { NsFormattedString, NsSpan } from '../views/text-runs';

/**
 * NativeScript view tags implemented as Angular components.
 * The selector is the NativeScript name (`ActionBar`, `Label`). `customElements.define` is not called:
 * a custom element name must contain a hyphen, so `define('ActionBar')` throws.
 * `ns-tab`, `ns-page`, and `ns-segmented-bar-item` stay plain child elements. Page and Frame are not registered.
 */
export const NS_ELEMENTS = {
  'ActionBar': NsActionBar,
  'NavigationButton': NsNavigationButton,
  'Tabs': NsTabs,
  'Pager': NsPager,
  'Drawer': NsDrawer,
  'GridLayout': NsGridLayout,
  'StackLayout': NsStackLayout,
  'WrapLayout': NsWrapLayout,
  'AbsoluteLayout': NsAbsoluteLayout,
  'DockLayout': NsDockLayout,
  'FlexboxLayout': NsFlexboxLayout,
  'SplitView': NsSplitView,
  'ContentView': NsContentView,
  'ScrollView': NsScrollView,
  'ActivityIndicator': NsActivityIndicator,
  'Progress': NsProgress,
  'Switch': NsSwitch,
  'Slider': NsSlider,
  'SearchBar': NsSearchBar,
  'SegmentedBar': NsSegmentedBar,
  'ListPicker': NsListPicker,
  'Label': NsLabel,
  'FormattedString': NsFormattedString,
  'Span': NsSpan,
  'Placeholder': NsPlaceholder,
  'Image': NsImage,
  'DatePicker': NsDatePicker,
  'TimePicker': NsTimePicker,
  'HtmlView': NsHtmlView,
  'ListView': NsListView,
  'Repeater': NsRepeater,
  'WebView': NsWebView,
} as const;

/**
 * Does not register custom elements. NativeScript selectors are illegal custom element names,
 * and these views are Angular components imported by the template that uses them.
 */
export function defineNsElements(_injector: Injector): void {
  return undefined;
}

export function provideNsElements(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => undefined);
}
