export { createRoutes, CONTENT_ROUTE_DATA } from './lib/routes';
export type { CreateRoutesOptions } from './lib/routes';
export { provideFileRouter } from './lib/provide-file-router';
export { injectContent, injectContentFiles } from './lib/content';
export type { InjectContentOptions } from './lib/content';
export { MarkdownComponent } from './lib/markdown.component';
export { isLiveCodeBlock, MARKDOWN_LIVE_CODE_COMPONENT, provideMarkdownLiveCode, segmentMarkdown } from './lib/live-code';
export type { MarkdownSegment } from './lib/live-code';
export { MarkdownRouteComponent } from './lib/markdown-route.component';
export { HrefDirective } from './lib/href.directive';
export type {
  ContentAttributes,
  ContentFile,
  ContentFileAttributes,
  ContentModule,
  MarkdownToken,
  RouteFiles,
  RouteMeta,
  RouteModule,
} from './lib/types';
