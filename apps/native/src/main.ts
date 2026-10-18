// organize-imports-ignore
// native-globals must evaluate before any @angular/cdk module.
import '../../../packages/ui/native/native-globals';
import { provideZonelessChangeDetection } from '@angular/core';
import { install as installDrawer } from '@nativescript-community/ui-drawer';
import { install as installBottomSheet } from '@nativescript-community/ui-material-bottomsheet';
import { bootstrapApplication, registerElement, runNativeScriptAngularApp } from '@nativescript/angular';
import { TabContentItem, Tabs, TabStrip, TabStripItem } from '@nativescript-community/ui-material-tabs';
import { provideFileRouter } from '@nativescript-unified/analog-native';
import { installMasonKit } from '@triniwiz/nativescript-masonkit/angular';
import { AppComponent } from './app/app.component';
import { provideSpartanNativeScript, registerSpartanNativeElements } from '../../../packages/ui/native/spartan-native';

installMasonKit({ componentHosts: { passthrough: [/-page$/, /^(demo-code-tabs|ui-demo)$/] } });
registerSpartanNativeElements();
// The plugin's /angular entry registers these as a tree-shaken side effect, so register them explicitly.
registerElement('MDTabs', () => Tabs);
registerElement('MDTabStrip', () => TabStrip);
registerElement('MDTabStripItem', () => TabStripItem);
registerElement('MDTabContentItem', () => TabContentItem);
installDrawer();
installBottomSheet();

runNativeScriptAngularApp({
  appModuleBootstrap: () =>
    bootstrapApplication(AppComponent, {
      providers: [provideFileRouter(), provideZonelessChangeDetection(), provideSpartanNativeScript()],
    }),
});
