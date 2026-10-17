import '@angular/compiler';
import '@angular/platform-server/init';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { App } from './app/app';
import { serverConfig } from './app/app.config.server';

/** Analog calls this once per prerendered route. */
export function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(App, serverConfig, context);
}

export default async function render(url: string, document: string): Promise<string> {
  return renderApplication(bootstrap, { document, url });
}
