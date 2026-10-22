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
import { registerCoreElementAliases } from '../../../packages/ui/native/core-elements';
import { installTouchFeedback } from '../../../packages/ui/native/touch-feedback';
import { View } from '@triniwiz/nativescript-masonkit';

View.preflight = true;

registerCoreElementAliases();
installMasonKit({
  componentHosts: {
    // Page roots and hosts whose template is a fill-parent `<scroll>` stay transparent, so the
    // scroller is measured by the Page or tab instead of growing with its content.
    passthrough: [/-page$/, /^(demo-code-tabs|ui-demo|ui-demo-body|guide-list)$/],
  },
});
registerSpartanNativeElements();
registerElement('BottomNavigation', () => BottomNavigation);
registerElement('Tabs', () => Tabs);
registerElement('TabStrip', () => TabStrip);
registerElement('TabStripItem', () => TabStripItem);
registerElement('TabContentItem', () => TabContentItem);
installDrawer();
installBottomSheet();
installTouchFeedback();

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
