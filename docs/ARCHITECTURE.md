# Architecture

## Overview

Archives VI is a Next.js (App Router) + React + TypeScript web application using
Styled Components as the official styling solution. See ADR-008 in
`docs/DECISIONS.md` for the migration from React + Vite.

The application is currently in MVP foundation stage. The priority is to build
a stable Home experience, a reusable design system and clear domain models
before adding complex pages or backend integrations.

## Folder Structure

Current structure (verified against the repository):

```txt
src/
  app/
    layout.tsx            Root layout: html lang pt-BR, fonts, metadata
    providers.tsx         Client providers (ThemeProvider, GlobalStyle)
    registry.tsx          Styled Components SSR registry (client)
    (site)/               Public route group (does not change URLs)
      layout.tsx          Header, main, footer and mobile tab bar
      page.tsx            Home (/)
      loading.tsx, error.tsx, not-found.tsx
      publicacoes/        /publicacoes
      publicacao/[slug]/  /publicacao/[slug]
      investigacoes/        /investigacoes (listing)
      investigacoes/[slug]/ /investigacoes/[slug]
      criar/                /criar (theory form with preview, simulated)
      entrar/               /entrar (demonstrative sign-in)
      criar-conta/          /criar-conta (demonstrative sign-up)
      buscar/               /buscar (search with tabs, URL state)
      criadores/            /criadores (creators list)
      perfil/[usuario]/     /perfil/[usuario] (public profile)
      explorar/             /explorar (discovery hub)
    components/          Legacy shadcn UI (ADR-006). Not a route, untouched.
  assets/images/         Source images, always imported (never referenced by path)
  components/
    acoes/               AcaoRestrita: disabled actions that need sign-in
    auth/                Demonstrative sign-in and sign-up forms
    busca/               Search form and result groups
    cards/               CaseCard, PublicationCard, CreatorCard
    comentarios/         ComposerBloqueado: disabled comment composer
    criar/               Theory form, preview and simulated submission
    perfil/              Profile header and publications section
    common/              Button (unused duplicate of ui/Button)
    filters/             FilterTabs (filters through URL)
    home/                Hero, ExploreCards, TrendingCases, Sidebar
    investigacao/        Investigation detail sections and graph
    layout/              Header, Navigation, MobileTabBar, Footer, ContentGrid, Container
    navigation/          Breadcrumb
    page/                PageHeader, PageBody, CardList
    publicacao/          Publication header and comments structure
    sidebar/             SidebarBox, ForumTopicList, UpdateList, AutorCard, RelacionadasList
    states/              Skeleton, EmptyState, ErrorState
    ui/                  Primitives: Avatar, Badge, Button, Card, StatusBadge, Input, Textarea, FormField
  constants/             Routes, navigation, filters, explore items, section images
  data/cases.ts         Unused; superseded by mocks/investigacoes.ts
  imports/              One PNG, not referenced by code
  lib/                   Data access (data.ts), investigation status mapping, formatting
  mocks/                 Demonstrative data in pt-BR
  styles/                theme.ts (official), global.ts, styled.d.ts. theme.css and globals.css are unused
  types/                 Domain types
```

Folder responsibilities:

- `src/app`: Next.js App Router. Route files are `page.tsx`, `layout.tsx`,
  `loading.tsx`, `error.tsx` and `not-found.tsx`. Other files are app-shell modules.
- `src/components`: official components, grouped by domain. Routes import them.
- `src/components/ui`: generic primitives. Each has styles, types and `index.ts`.
- `src/constants`: route map, navigation items, filters, explore items and section images.
- `src/lib`: data access (`data.ts`) and small pure helpers. Pages never import mocks directly.
- `src/mocks`: demonstrative data. One file per type.
- `src/styles`: theme, global styles and styling type declarations.
- `src/types`: shared domain types.

Generated legacy UI:

- `src/app/components/` contains generated shadcn/Tailwind-style components.
- It is kept untouched (ADR-006) and is not imported by any route.
- It is excluded from `tsconfig.json` and from ESLint, so it does not affect typecheck, lint or build.
- It is not the design system. New primitives go under `src/components/ui`.

## Rendering Model

- `src/app/layout.tsx` is a Server Component. It sets the document shell and
  metadata and wraps children in the Styled Components registry and providers.
- `src/app/(site)/page.tsx` (Home) is a Server Component and is prerendered as static HTML.
  Detail and listing pages are dynamic.
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
4. `src/app/(site)/layout.tsx` renders the shell; the route `page.tsx` composes the sections.
   Data comes from `src/lib/data.ts`, which reads the mocks in `src/mocks/`.
5. Components consume theme tokens through Styled Components.

Target MVP flow:

1. Static case data is modeled in `src/types`.
2. Mock data is stored in `src/mocks/` and accessed only through `src/lib/data.ts`.
3. Home sections receive data through props.
4. UI primitives render reusable presentation states.
5. Future API/backend integrations can replace mock data without rewriting UI.

## Assets and Fonts

- Images imported from `src/assets` are bundled by Next.js. Use the import and
  its `.src` value (for example `url("${heroImage.src}")`), never a path
  string such as `/src/assets/...`, which does not exist in the production
  output.
- Barlow Condensed (`--font-display`, weights 600, 700, 800) is used for headings.
- Inter (`--font-inter`) is used for body text. Both are loaded with `next/font/google`
  in `src/app/layout.tsx`, self-hosted at build time.
- Section images are registered in `src/constants/imagensSecoes.ts` and imported there.
- Poppins (`theme.fonts.secondary`) is declared in the theme but not loaded
  yet, because no component uses it.

## Theme

The official theme lives in `src/styles/theme.ts`.

Token groups:

- `colors`: backgrounds, surfaces, brand colors, text and status colors.
- `fonts`: `display` (headings), `primary` (body), `secondary` (declared, not loaded) and `mono` (system monospace for identifiers).
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

- Avatar
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

## Demonstrative Data

- All data under `src/mocks/` is demonstrative and in pt-BR. It does not describe real users, content or activity.
- The online counter (`src/mocks/atividade.ts`, `investigadoresOnline = 312`) is a demonstrative value.
  There is no backend and no real-time presence, so the number must never be presented as a real count.
- `src/data/cases.ts` (English, unused) is superseded by `src/mocks/investigacoes.ts`.

## Test States (development only)

- `getPublicacoes` accepts a simulation flag from the URL (`?simular=vazio|erro|lento`).
- The flag only has effect when `NODE_ENV !== "production"`. In production builds it is ignored.
- Use `npm run dev` to test empty, error and loading states.

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
