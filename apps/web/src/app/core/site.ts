/**
 * Canonical origin used for canonical links, Open Graph URLs and the sitemap.
 * Set VITE_SITE_URL at build time (for example https://docs.example.com). The default is a placeholder.
 */
export const SITE_NAME = 'NativeScript Unified';
export const DEFAULT_SITE_URL = 'https://nativescript-unified.example';
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
export const SITE_URL = (env?.['VITE_SITE_URL'] || DEFAULT_SITE_URL).replace(/\/+$/, '');