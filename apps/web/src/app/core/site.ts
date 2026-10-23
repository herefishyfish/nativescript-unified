/**
 * Canonical origin used for canonical links, Open Graph URLs and the sitemap.
 * Set VITE_SITE_URL at build time (for example https://docs.example.com). The default is a placeholder.
 */
export const SITE_NAME = 'NativeScript Unified';
export const DEFAULT_SITE_URL = 'https://nativescript-unified.example';
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
export const SITE_URL = (env?.['VITE_SITE_URL'] || DEFAULT_SITE_URL).replace(/\/+$/, '');

export interface ExamplesAppLink {
  readonly id: 'app-store' | 'google-play' | 'stackblitz';
  readonly caption: string;
  readonly label: string;
  readonly icon: string;
  readonly url: string | null;
}

export const EXAMPLES_APP_LINKS: readonly ExamplesAppLink[] = [
  { id: 'app-store', caption: 'Download on the', label: 'App Store', icon: 'lucideApple', url: null },
  { id: 'google-play', caption: 'Get it on', label: 'Google Play', icon: 'lucidePlay', url: null },
  { id: 'stackblitz', caption: 'NativeScript Preview on', label: 'StackBlitz', icon: 'lucideZap', url: null },
];
