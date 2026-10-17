import 'zone.js/node';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// Only used when SSR is turned on in vite.config.mts (analog({ ssr: true })).
export function bootstrap(context?: unknown) {
  return bootstrapApplication(App, appConfig, context as never);
}

export default async function render(url: string, document: string): Promise<string> {
  return renderApplication(bootstrap, { document, url });
}
