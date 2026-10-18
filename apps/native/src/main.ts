// organize-imports-ignore
// native-globals must evaluate before any @angular/cdk module.
import '../../../packages/ui/native/native-globals';
import { provideZonelessChangeDetection } from '@angular/core';
import { install as installDrawer } from '@nativescript-community/ui-drawer';
import { install as installBottomSheet } from '@nativescript-community/ui-material-bottomsheet';
import { bootstrapApplication, runNativeScriptAngularApp } from '@nativescript/angular';
import { provideFileRouter } from '@nativescript-unified/analog-native';
import { installMasonKit } from '@triniwiz/nativescript-masonkit/angular';
import { AppComponent } from './app/app.component';
import { provideSpartanNativeScript, registerSpartanNativeElements } from '../../../packages/ui/native/spartan-native';

installMasonKit({ componentHosts: { passthrough: [/-page$/] } });
registerSpartanNativeElements();
installDrawer();
installBottomSheet();

runNativeScriptAngularApp({
  appModuleBootstrap: () =>
    bootstrapApplication(AppComponent, {
      providers: [provideFileRouter(), provideZonelessChangeDetection(), provideSpartanNativeScript()],
    }),
});
