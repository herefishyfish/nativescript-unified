import type { EnvironmentProviders } from '@angular/core';
import type { RouterFeatures } from '@angular/router';
import { provideNativeScriptRouter } from '@nativescript/angular';
import { pageFiles } from './files';
import { MarkdownRouteComponent } from './markdown-route.component';
import { createRoutes } from './routes';

/** `provideNativeScriptRouter` with routes generated from the files under `src/app/pages`. */
export function provideFileRouter(...features: RouterFeatures[]): EnvironmentProviders {
  return provideNativeScriptRouter(createRoutes(pageFiles(), { markdownComponent: MarkdownRouteComponent }), ...features);
}
