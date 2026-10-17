import { bootstrapApplication, runNativeScriptAngularApp } from '@nativescript/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideFileRouter } from '@nativescript/analog';
import { installMasonKit } from '@triniwiz/nativescript-masonkit/angular';
import { AppComponent } from './app/app.component';

installMasonKit();

runNativeScriptAngularApp({
  appModuleBootstrap: () =>
    bootstrapApplication(AppComponent, {
      providers: [provideFileRouter(), provideZonelessChangeDetection()],
    }),
});
