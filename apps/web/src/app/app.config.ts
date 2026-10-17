import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideFileRouter } from '@analogjs/router';
import { withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideNsElements } from '@nativescript-unified/web-polyfills';

/** Web core providers. Native has its own in apps/native. */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideFileRouter(withComponentInputBinding(), withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    provideNsElements(),
  ],
};
