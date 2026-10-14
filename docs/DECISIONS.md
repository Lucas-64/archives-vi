# Architecture Decisions

## ADR-001: React + Vite During MVP

Decision: Archives VI will use React + Vite during the MVP stage.

Reasoning:

- Fast local development.
- Simple build pipeline.
- Lower migration overhead while the product direction is still forming.
- Good fit for a portfolio-stage front-end application.

Status: Superseded by ADR-008

## ADR-002: Defer Next.js Migration

Decision: Next.js migration will happen only after the Home MVP is complete.

Reasoning:

- The project needs stable UI primitives and product structure first.
- Premature migration would add routing, SSR and asset concerns before the
  product surface is defined.
- A future migration remains valuable for SEO, case pages and server-rendered
  content.

Status: Superseded by ADR-008 (migration brought forward by the project owner)

## ADR-003: Styled Components as Official Styling Solution

Decision: Styled Components is the official styling approach.

Reasoning:

- The project already has a typed theme and global style setup.
- Component-scoped styling fits the design system direction.
- Theme tokens can be consumed directly in components.

Status: Accepted

## ADR-004: `src/components` as Official Components Directory

Decision: `src/components` is the official directory for layout, feature and UI
components.

Reasoning:

- Keeps the application structure clear.
- Separates official components from generated legacy UI under
  `src/app/components/ui`.
- Supports future migration while preserving reusable components.

Status: Accepted

## ADR-005: Design System Before New Pages

Decision: UI primitives will be created before building new pages.

Reasoning:

- Reduces duplicated styling.
- Improves consistency.
- Makes future Home and Cases work faster.
- Supports portfolio-quality engineering documentation.

Status: Accepted

## ADR-006: Keep Generated Legacy UI Temporarily

Decision: Generated legacy UI folders will remain untouched until removal is
planned explicitly.

Reasoning:

- Avoids accidental regressions.
- Preserves imported references while the official system is stabilized.
- Allows cleanup to happen as a dedicated technical debt task.

Status: Accepted

## ADR-007: Conventional Commits

Decision: The project follows Conventional Commits.

Reasoning:

- Improves history readability.
- Supports changelog generation.
- Communicates intent clearly in portfolio review.

Status: Accepted

## ADR-008: Migrate to Next.js App Router

Decision: Archives VI moves from React + Vite to Next.js with the App Router,
TypeScript in strict mode and Styled Components. This supersedes ADR-001 and
ADR-002.

Justification:

- The project owner asked for the migration before building the next pages.
  ADR-002's trigger ("Home MVP complete") was not met, so this is an explicit
  exception and not the planned path.
- The trigger that matters for routing is now present: the next work is case
  pages, which need file-based routing and server-rendered HTML for SEO.
- Doing the migration before more pages exist keeps the cost low: only the
  Home (one route) moves.

Consequences:

- React is upgraded from 18.3.1 to 19.2.9. The Next.js App Router is built on
  React 19, and running React 18 would mean mixing two major versions of React.
- Styled Components needs an SSR registry (`src/app/registry.tsx`) and a
  client provider (`src/app/providers.tsx`). Its `@types` package is removed,
  because Styled Components 6 ships its own types.
- Components that use Styled Components are `'use client'`.
- Vite, Tailwind (the Vite plugin, PostCSS config and CSS entry files) and the
  `figma:asset` resolver are removed. Tailwind is not used by the official
  code; see ADR-006 for the legacy folder.
- The Next.js version is 16.4.0 (stable, requires Node.js 20.9 or later).

Status: Accepted
