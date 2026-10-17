import type { ContentFileAttributes, ContentModule, RouteFiles } from './types';

// The nativescriptAnalog() Vite plugin replaces each marker string with an
// import.meta.glob(...) call. A value still holding its marker means the plugin is missing.
const PAGE_FILES: unknown = '__NS_ANALOG_PAGE_FILES__';
const MARKDOWN_PAGE_FILES: unknown = '__NS_ANALOG_MARKDOWN_PAGE_FILES__';
const CONTENT_FILES: unknown = '__NS_ANALOG_CONTENT_FILES__';
const CONTENT_ATTRIBUTE_FILES: unknown = '__NS_ANALOG_CONTENT_ATTRIBUTE_FILES__';

function globbed<T>(value: unknown): T {
  if (typeof value === 'string') {
    throw new Error(
      `[@nativescript-unified/analog-native] ${value} was not replaced. Add nativescriptAnalog() from '@nativescript-unified/analog-native/vite' to vite.config plugins.`,
    );
  }
  return value as T;
}

export function pageFiles(): RouteFiles {
  return { ...globbed<RouteFiles>(PAGE_FILES), ...globbed<RouteFiles>(MARKDOWN_PAGE_FILES) };
}

export function contentFiles(): Record<string, () => Promise<ContentModule>> {
  return globbed(CONTENT_FILES);
}

export function contentAttributeFiles(): Record<string, ContentFileAttributes> {
  return globbed(CONTENT_ATTRIBUTE_FILES);
}
