/** Vite's `?raw` imports, for the example sources (each app's bundler resolves them). */
declare module '*?raw' {
  const source: string;
  export default source;
}
