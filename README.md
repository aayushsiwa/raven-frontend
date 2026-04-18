# Raven Dashboard: Premium RSS Reader

The Raven Dashboard is a high-performance, PWA-ready RSS aggregator built for a premium reading experience. It features a responsive design that adapts seamlessly between desktop and mobile interfaces, a serif-first "Reader Mode," and a robust theming engine.

## ✨ Key Features

- **Omni-Channel Architecture**: Unique adaptive shells for Web and Mobile platforms sharing a common logic core.
- **Premium Reader Mode**: Clutter-free reading experience with sanitized HTML and high-legibility serif typography.
- **Smart Theming**: Includes "Dawn Ledger" (light) and "Midnight Dossier" (dark) presets with support for live variable overrides.
- **PWA Ready**: Fully installable on mobile and desktop with offline shell support.
- **Interest Discovery**: Hierarchical topic picker to customize your personal signal.
- **Archive System**: Save stories for later reading with local/cloud sync.

## 🏗 Architecture

The frontend follows a **Feature-Interface** separation pattern:

- **`src/features/`**: Pure logic and state management (Auth, Feed Data, Saved Articles, Theme). These use hooks to expose functionality.
- **`src/interfaces/`**: Platform-specific layouts.
  - `shared/`: Route content components used by both platforms.
  - `web/`: The desktop-optimized application shell.
  - `mobile/`: The gesture-driven navigation and mobile shell.
- **`src/routes/`**: Type-safe routing powered by TanStack Router.

## 🛠 Tech Stack

- **Core**: React 19, TypeScript 5, Vite 6
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS, Framer Motion (for micro-animations)
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Configuration

Create a `.env.local` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8080
```

### Installation & Development

```bash
pnpm install
pnpm dev
```

### Build for Production

```bash
pnpm build
```

## 🧪 Developer Workflow

We maintain high code quality with automated checks:

- **Run All Checks**: `pnpm run-checks` (Lint, Types, Format)
- **Linting**: `pnpm lint`
- **Type Checking**: `pnpm type-check`
- **Auto-Formatting**: `pnpm format`

## 📱 PWA Installation

Navigate to your hosted instance in a Chromium-based browser and look for the "Install" icon in the address bar, or use the "Add to Home Screen" option on iOS/Android.

---

> [!IMPORTANT]
> When adding new routes, ensure that the route component logic is separated into `src/interfaces/shared/routes/` to ensure full compatibility with the Web/Mobile split architecture.
