# Blank app

An Nx workspace with one Angular app for the web, Android and iOS, built on
[nativescript-unified](https://github.com/herefishyfish/nativescript-unified).

```
apps/web/          AnalogJS app. File routes in src/app/pages
apps/native/       NativeScript app. File routes in src/app/pages
packages/shared/   Your screens, used by both apps
packages/*         Components, theme, router and polyfills, kept current by template updates
```

## Commands

```bash
npm install
npm run web          # dev server
npm run build:web    # static site in dist/apps/web/analog/public
npm run android      # needs the NativeScript CLI and the Android SDK
npm run ios          # needs a Mac with Xcode
npm run typecheck
npm test
```

## Make it yours

- Set the app id in `apps/native/nativescript.config.ts`.
- Change the title in `apps/web/index.html`.
- Replace the icons and splash screens in `apps/native/App_Resources`.
- Change the colors in `packages/ui/styles/tokens.css`.

## Update from the template

Commit your work first, then run:

```bash
npm run update:template
```

This merges the latest template into your branch and installs its dependencies. If Git reports conflicts, resolve
them in your files, run `npm install` (npm resolves conflicts in `package-lock.json`), then commit. Files you changed
under `packages/`, other than `packages/shared`, are the likeliest to conflict.

The merge needs the template's Git history. Start an app by cloning the `blank` branch, not by copying its files.
