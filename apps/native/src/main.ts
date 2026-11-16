// organize-imports-ignore
// native-globals must evaluate before any @angular/cdk module.
import '../../../packages/ui/native/native-globals';
import { importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { FontIconModule } from 'nativescript-fonticon/angular';
import lucideCss from 'lucide-static/font/lucide.css?raw';
import { install as installDrawer } from '@nativescript-community/ui-drawer';
import { install as installBottomSheet } from '@nativescript-community/ui-bottomsheet';
import { bootstrapApplication, registerElement, runNativeScriptAngularApp } from '@nativescript/angular';
import { BottomNavigation } from '@nativescript-community/ui-bottom-navigation';
import { TabContentItem, TabStrip, TabStripItem } from '@nativescript-community/ui-core-tabs';
import { Tabs } from '@nativescript-community/ui-tabs';
import { provideFileRouter, provideMarkdownLiveCode } from '@nativescript-unified/analog-native';
import { installMasonKit } from '@triniwiz/nativescript-masonkit/angular';
import { AppComponent } from './app/app.component';
import { NsLiveDemo } from './app/markdown/live-demo';
import { provideSpartanNativeScript, registerSpartanNativeElements } from '../../../packages/ui/native/spartan-native';
import { registerCommaSeparatedItems, registerCoreElementAliases } from '../../../packages/ui/native/core-elements';
import { installSelectionHaptics } from '../../../packages/ui/native/selection-haptics';
import { registerNativeElements } from '../../../packages/ui/native/native-elements';
import { installNativeDialogs } from '../../../packages/ui/native/native-elements/dialogs';
import { NativeTextField } from '../../../packages/ui/native/native-elements/text-field';
import { NativeTextView } from '../../../packages/ui/native/native-elements/text-view';
import { View } from '@triniwiz/nativescript-masonkit';

View.preflight = true;

registerCoreElementAliases();
registerCommaSeparatedItems();
installMasonKit({
  componentHosts: {
    // Page roots and hosts whose template is a fill-parent `<scroll>` stay transparent, so the
    // scroller is measured by the Page or tab instead of growing with its content.
    passthrough: [/-page$/, /^(demo-code-tabs|ui-demo|ui-demo-body|guide-list)$/],
  },
});
registerSpartanNativeElements();
// Platform text fields everywhere; provideMasonElements() brings back MasonKit's in a scope. See docs/native-elements.
registerNativeElements({ input: NativeTextField, textarea: NativeTextView });
// Material alert(), confirm() and prompt() instead of core's; see docs/native-elements.
installNativeDialogs();
registerElement('BottomNavigation', () => BottomNavigation);
registerElement('Tabs', () => Tabs);
registerElement('TabStrip', () => TabStrip);
registerElement('TabStripItem', () => TabStripItem);
registerElement('TabContentItem', () => TabContentItem);
installDrawer();
installBottomSheet();
installSelectionHaptics();

runNativeScriptAngularApp({
  appModuleBootstrap: () =>
    bootstrapApplication(AppComponent, {
      providers: [
        importProvidersFrom(FontIconModule.forRoot({ icon: lucideCss })),
        provideFileRouter(),
        provideZonelessChangeDetection(),
        provideSpartanNativeScript(),
        provideMarkdownLiveCode(NsLiveDemo),
      ],
    }),
});
