import { Application, Color } from '@nativescript/core';
import { MarkdownView } from '@nstudio/nativescript-markdown-view';

/** Theme tokens (packages/ui/styles/tokens.css) used by the native Markdown renderer. */
const PALETTE = {
  light: { foreground: '#10302f', link: '#27695f', codeBg: '#e3d9c4', codeText: '#10302f', border: '#d3c7ad', quote: '#46605c' },
  dark: { foreground: '#f2ebdd', link: '#5ea396', codeBg: '#2b2d27', codeText: '#f2ebdd', border: '#3a3b33', quote: '#b5ab97' },
};

declare const io: any;

/** NativeScript stamps ns-dark / ns-light on the root view, which the CSS tokens key off. Application.systemAppearance() can lag it. */
function isDark(): boolean {
  const classes = Application.getRootView()?.cssClasses;
  return classes?.has('ns-dark') ? true : classes?.has('ns-light') ? false : Application.systemAppearance() === 'dark';
}

/**
 * `@nstudio/nativescript-markdown-view` with the app theme. The package builds a default Markwon on Android with no
 * theming hook, so this subclass rebuilds it with a theme plugin and follows light/dark changes.
 * Link taps outside http(s) go to `MarkdownThemedView.onLink` (the router), http(s) opens the browser.
 */
export class ThemedMarkdownView extends MarkdownView {
  static onLink: ((href: string) => void) | undefined;
  private appearanceHandler = () => setTimeout(() => this.rebuild(), 50);

  override initNativeView(): void {
    super.initNativeView?.();
    Application.on('systemAppearanceChanged', this.appearanceHandler);
  }

  override disposeNativeView(): void {
    Application.off('systemAppearanceChanged', this.appearanceHandler);
    super.disposeNativeView?.();
  }

  override createNativeView(): any {
    const view = super.createNativeView();
    if (this.nativeView) this.buildMarkwon();
    return view;
  }

  private buildMarkwon(): void {
    const dark = isDark();
    const p = dark ? PALETTE.dark : PALETTE.light;
    const c = (hex: string) => new Color(hex).android as number;
    const markwon = io.noties.markwon;
    const ThemePlugin = markwon.AbstractMarkwonPlugin.extend({
      configureTheme(builder: any) {
        builder
          .linkColor(c(p.link))
          .isLinkUnderlined(true)
          .codeTextColor(c(p.codeText))
          .codeBackgroundColor(c(p.codeBg))
          .codeBlockTextColor(c(p.codeText))
          .codeBlockBackgroundColor(c(p.codeBg))
          .blockQuoteColor(c(p.border))
          .listItemColor(c(p.foreground))
          .thematicBreakColor(c(p.border))
          .codeTypeface(android.graphics.Typeface.MONOSPACE);
      },
      configureConfiguration(builder: any) {
        builder.linkResolver(
          new markwon.LinkResolver({
            resolve(_view: any, link: string) {
              if (/^https?:\/\//.test(link)) {
                const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(link));
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                Application.android.context.startActivity(intent);
              } else {
                ThemedMarkdownView.onLink?.(link);
              }
            },
          }),
        );
      },
    });
    const img = markwon.image;
    (this as any).markwon = markwon.Markwon.builder(this._context)
      .usePlugin(img.ImagesPlugin.create())
      .usePlugin(markwon.ext.strikethrough.StrikethroughPlugin.create())
      .usePlugin(markwon.ext.tables.TablePlugin.create(this._context))
      .usePlugin(new ThemePlugin())
      .build();
    // The plugin's setInputType(TYPE_NULL) leaves the TextView in single-line mode, which clips long documents.
    this.nativeView.setSingleLine(false);
    this.nativeView.setMaxLines(2147483647);
    this.nativeView.setHorizontallyScrolling(false);
    this.nativeView.setTextColor(c(p.foreground));
    this.nativeView.setLinkTextColor(c(p.link));
    this.nativeView.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());
  }

  private rebuild(): void {
    if (!this.nativeViewProtected) return;
    this.buildMarkwon();
    (this as any).markwon.setMarkdown(this.nativeView, (this as any).markdown ?? '');
  }
}








