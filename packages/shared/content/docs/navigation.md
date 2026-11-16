---
title: Navigation
section: Routing and content
order: 16
description: Moving forward and back between screens on web and native, and the native back stack.
---

# Navigation

Both apps navigate with Angular's router. The router decides which component a URL shows, and an outlet decides how the change looks. On the web, `<router-outlet>` swaps the component in place, and the browser keeps the history. On native, `<page-router-outlet>` opens each route as a new native page, with the platform's transition, and keeps a back stack the way native apps do.

## Outlets

| Outlet | Where | What a navigation does |
| --- | --- | --- |
| `<router-outlet>` | Web, and inside a native page | Replaces the component in place. On native it adds no back-stack entry. |
| `<page-router-outlet>` | Native app root (`apps/native/src/app/app.component.ts`) | Pushes a new native page with the platform's default transition. Back pops it. |

A layout page that holds child routes uses `<router-outlet>` on both platforms, so moving between its children on native changes the content without a new page. Use separate top-level routes for screens that the user should be able to go back from.

## Go forward

### In shared code

`Router` works on both platforms, so code in a shared package can navigate with it:

```ts
import { Router } from '@angular/router';

export class ProductList {
  private readonly router = inject(Router);

  open(id: string): void {
    void this.router.navigate(['/products', id]);
  }
}
```

In templates, `<a href="/products/42">` navigates on both. The browser follows the link on the web. On native, `analog-native`'s `HrefDirective` sends app paths to the router and opens full URLs in the system browser. `routerLink` works on the web. On native, use `nsRouterLink`.

### Native only

`RouterExtensions` from `@nativescript/angular` wraps the router with native page options:

```ts
import { RouterExtensions } from '@nativescript/angular';

export class LoginPage {
  private readonly routerExtensions = inject(RouterExtensions);

  signedIn(): void {
    void this.routerExtensions.navigate(['/home'], {
      clearHistory: true,
      transition: { name: 'fade', duration: 200 },
    });
  }
}
```

| Option | Effect |
| --- | --- |
| `clearHistory` | Empties the back stack, so the new page is the first. Use it after sign-in or onboarding. |
| `animated` | `false` shows the new page without a transition. |
| `transition` | A core `NavigationTransition`, such as `{ name: 'slide' }`, `'fade'` or `'flip'`, with an optional `duration` and `curve`. |
| `replaceUrl` | Replaces the current page instead of pushing one. |

`nsRouterLink` takes the same choices in a template: `[nsRouterLink]="['/home']"` with `clearHistory`, `pageTransition` and `pageTransitionDuration`.

## Go back

| Platform | Back control | In code |
| --- | --- | --- |
| Web | The browser's back button | `Location.back()` from `@angular/common` |
| Android | The system back button or gesture | `RouterExtensions.back()` |
| iOS | The back button in the navigation bar, or a swipe from the left edge | `RouterExtensions.back()` |

`RouterExtensions` also has `canGoBack()`, which is `false` on the first page, and `backToPreviousPage()` and `canGoBackToPreviousPage()`, which skip child-route changes inside the current page and go straight to the previous native page.

On iOS, the navigation bar shows a back button on every page after the first. A `<NavigationButton text="Back">` in the page's `<ActionBar>` sets its text. On Android, a `NavigationButton` shows an icon but does not go back by itself, so give it a handler:

```html
<ActionBar title="Product">
  <NavigationButton text="Back" android.systemIcon="ic_menu_back" (tap)="back()" />
</ActionBar>
```

```ts
back(): void {
  this.routerExtensions.back();
}
```

The Android back button closes what is in front of the page first. An open sheet, drawer or full-screen picker closes, and the page stays. A second press goes back.

## Web vs native

Native back is a stack of pages, not a browser history. A deep link to `/products/42` on native opens that page with nothing under it, so `canGoBack()` is `false` there. Give such a page its own way out, such as a link home. On the web, the browser keeps the history, and the address bar shows each URL.

Each app owns its own navigation shell: the web app has a header and sidebar, and the native app has a `BottomNavigation` and an `ActionBar`. See [Navigation views](/docs/navigation-views) for those, and [File-based routing](/docs/file-routing) for how routes are defined.
