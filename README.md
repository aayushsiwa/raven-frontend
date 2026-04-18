# Raven Frontend PWA

TanStack React frontend for Raven backend. Supports installable PWA, feed browsing, RSS preview, subscription create/delete/list.

## Stack

- React + TypeScript + Vite
- `@tanstack/react-query`
- `vite-plugin-pwa`
- Aceternity-inspired UI components (local lightweight versions)

## Run

From `frontend/`:

```bash
pnpm install
pnpm dev
```

App default backend URL: `http://127.0.0.1:8080`.

## Build

```bash
pnpm build
```

PWA artifacts generated in `dist/` including:

- `manifest.webmanifest`
- `sw.js`
- Workbox runtime chunk

## Install PWA

1. Open app in Chromium-based browser.
2. Click `Install PWA` button when prompt available.
3. Or use browser install icon in address bar.

## Notes

- Backend must allow browser access from frontend origin (CORS).
- `vite-plugin-pwa@1.2.0` shows peer warning with Vite 8, but build works in this repo.
