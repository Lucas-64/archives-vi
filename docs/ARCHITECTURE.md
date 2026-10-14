# Architecture

## Overview

Archives VI is a Next.js (App Router) + React + TypeScript web application using
Styled Components as the official styling solution. See ADR-008 in
`docs/DECISIONS.md` for the migration from React + Vite.

The application is currently in MVP foundation stage. The priority is to build
a stable Home experience, a reusable design system and clear domain models
before adding complex pages or backend integrations.

## Folder Structure

Current official structure:

```txt
src/
  app/
    layout.tsx        Root layout (html/body, fonts, metadata)
    page.tsx          Home route (/)
    providers.tsx     Client providers (ThemeProvider, GlobalStyle)
    registry.tsx      Styled Components SSR registry (client)
    components/ui/    Generated legacy shadcn UI (untouched, see below)
  assets/
    images/
  components/
    home/
    layout/
    ui/
      Badge/
      Button/
      Card/
      StatusBadge/
  constants/
  data/
  styles/
  types/
```

Folder responsibilities:

- `src/app`: Next.js App Router. Only `layout.tsx` and `page.tsx` (and route
  files added later) are routes. Other files here are shared app-shell modules.
- `src/components`: official component directory for layout, feature and UI
  primitives. Imported by routes in `src/app`.
- `src/components/ui`: official reusable design system primitives.
- `src/components/layout`: layout-level components such as Header, Footer and
  Container.
- `src/components/home`: Home-specific sections.
- `src/styles`: theme, global styles and styling type declarations.
- `src/data`: static or mocked domain data during MVP development.
- `src/types`: shared domain TypeScript types.
- `src/constants`: shared constants such as future route definitions.

Generated legacy UI:

- `src/app/components/ui` contains generated shadcn/Tailwind-style components.
- This folder is kept untouched (ADR-006). It is not imported by any route.
- It is excluded from `tsconfig.json` (`exclude`) so it does not affect
  typecheck or build.
- It is not the official design system.
- New official UI primitives must be created under `src/components/ui`.

## Rendering Model

- `src/app/layout.tsx` is a Server Component. It sets the document shell and
  metadata and wraps children in the Styled Components registry and providers.
- `src/app/page.tsx` is a Server Component and is prerendered as static HTML.
- Components that define or use Styled Components are marked `'use client'`.
  Styled Components creates React context at module level, which is not
  available in Server Components. Components with no styles and no state
  (for example plain data-only modules) stay on the server.
- `src/app/registry.tsx` collects styles during SSR and injects them into the
  HTML stream, so the first paint has styles and hydration does not regenerate
  them.

## Data Flow

Current MVP flow:

1. `src/app/layout.tsx` sets `<html>`, `<body>` and the Inter font variable.
2. `StyledComponentsRegistry` collects styles during SSR.
3. `Providers` injects the Styled Components `ThemeProvider` and `GlobalStyle`.
4. `src/app/page.tsx` composes Home-level components.
5. Components consume theme tokens through Styled Components.

Target MVP flow:

1. Static case data is modeled in `src/types`.
2. Mock case data is stored in `src/data`.
3. Home sections receive data through props.
4. UI primitives render reusable presentation states.
5. Future API/backend integrations can replace mock data without rewriting UI.

## Assets and Fonts

- Images imported from `src/assets` are bundled by Next.js. Use the import and
  its `.src` value (for example `url("${heroImage.src}")`), never a path
  string such as `/src/assets/...`, which does not exist in the production
  output.
- Inter is loaded with `next/font/google` in `src/app/layout.tsx`, self-hosted
  at build time, and exposed as `--font-inter`. `theme.fonts.primary` uses that
  variable.
- Poppins (`theme.fonts.secondary`) is declared in the theme but not loaded
  yet, because no component uses it.

## Theme

The official theme lives in `src/styles/theme.ts`.

Token groups:

- `colors`: backgrounds, surfaces, brand colors, text and status colors.
- `fonts`: primary and secondary font families.
- `fontSize`: reusable typography scale.
- `spacing`: spacing scale for layout and components.
- `borderRadius`: shape scale.
- `shadows`: card and glow effects.
- `transitions`: shared motion timing.
- `breakpoints`: responsive layout thresholds.

All Styled Components should use theme tokens whenever an appropriate token
exists.

## Design System

The design system is built with Styled Components and lives in
`src/components/ui`.

Created primitives:

- Button
- Card
- Badge
- StatusBadge

Design system rules:

- Components should be reusable and typed.
- Components should accept native HTML props when appropriate.
- Styles should be split from component logic.
- Public exports should go through `index.ts`.
- New pages should be built from primitives whenever possible.

## Build and Validation

Commands (run from the project root):

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint       # eslint 9 with eslint-config-next (flat config: eslint.config.mjs)
npm run build      # next build (production build)
npm run start      # serves the production build
```

Validation should be run after changes that affect TypeScript, imports,
components or styling infrastructure. Run `typecheck`, `lint` and `build`
separately; `next build` does not run ESLint.

ESLint excludes `src/app/components` (ADR-006), `dist/` (stale Vite output) and
the generated Next.js folders.

Pending: there is no automated test suite yet.
