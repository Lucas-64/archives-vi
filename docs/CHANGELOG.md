# Changelog

All notable changes to Archives VI will be documented in this file.

The project follows Semantic Versioning and Conventional Commits.

## [Unreleased]

### Added

- `/publicacoes` listing with filters (Todas, Teorias, Investigações), loading, empty and error states.
- `/investigacoes/[slug]` detail page (demonstrative data): theory, evidence, discussion, connections graph, history and synthesis. Authenticated actions are disabled with a link to sign-in.
- `Avatar`, `AcaoRestrita` and `ComposerBloqueado` shared components.
- `/investigacoes` listing with filters (Todas, Em andamento, Resolvidas, Sem fontes) in a vertical list with the sidebar. "Todas" includes every record, including community and classified.
- `CaseCard` optional `orientacao="horizontal"` (default unchanged), used in the listing.
- Section images (`galery_day`, `map_day`, `teory_night`) on the Explore tiles, registered in `src/constants/imagensSecoes.ts`.
- Form foundation: `Input`, `Textarea` and `FormField` in `src/components/ui/`, and `CreatorCard` in `src/components/cards/`.
- `/criar`: theory form with live preview and a simulated submission, clearly labeled as simulation. Nothing is saved.
- `/entrar` and `/criar-conta`: demonstrative forms. They state that no session or account is created and that nothing is saved.
- `/buscar`: search across publications, investigations and creators, with tabs and state kept in the URL.
- `/criadores`: list of the creators in the mocks, with links to their profiles.
- `/perfil/[usuario]`: public profile with the creator's publications. Unknown users get the "not found" page.
- `/explorar`: discovery hub with the four explore tiles and "Mistérios em alta". It has no navigation entry yet.

### Changed

- `/buscar` ignores accents and letter case: "frequencia" finds "Frequência". Data and displayed titles are unchanged.
- `/criadores`: the description no longer says creators publish investigations, because investigations have no author.
- `/explorar`: the hidden section heading reads "Seções para explorar" instead of "Tipos de conteúdo".
- Home investigation cards link to `/investigacoes/[slug]`; the "Ver mais" link points to `/investigacoes`.
- `/publicacoes` lists publications in a single vertical column with the sidebar on the right.
- Migrated from React + Vite to Next.js 16.4.0 with the App Router (ADR-008).
- Upgraded React and React DOM from 18.3.1 to 19.2.9.
- Styled Components now uses an SSR registry and a client provider in the App Router.
- Home moved to `src/app/page.tsx`; root layout in `src/app/layout.tsx`.
- Inter is loaded with `next/font`; `theme.fonts.primary` uses its variable.
- Scripts are now `dev`, `build`, `start` and `typecheck`.

### Fixed

- `FormField`: an `id` passed to a control inside it no longer breaks the label link. The generated id wins inside `FormField`.
- `/criar-conta`: the password hint no longer repeats the minimum-length error.
- Heading levels: publication and creator results inside `/buscar` and the profile's publications section use `h3` under their `h2` section headings. The `nivelTitulo` prop defaults to `h2`, so other pages are unchanged.
- Hero background image now comes from an import, so it is included in the production build.
- Removed empty `ui/Badge.tsx`, `ui/Button.tsx` and `ui/Card.tsx`, which shadowed the component folders.

### Removed

- Vite, Tailwind (Vite plugin, PostCSS config, CSS entry files), `@types/styled-components`, and unused `react-popper`, `@popperjs/core` and `react-day-picker`.

## [0.3.0] - 2026-07-01

### Added

- Official Button design system primitive.
- Official Card design system primitive.
- Official Badge design system primitive.
- Official StatusBadge component built on top of Badge.
- Design system documentation for created UI primitives.
- Architecture decisions document.
- Sprint documentation set.

### Changed

- Documentation expanded for product, engineering and Scrum portfolio use.

## [0.2.0] - 2026-06-30

### Added

- Architecture note defining `src/components` as the official components
  directory.

### Changed

- Active Header and Hero were consolidated into `src/components`.
- App imports were updated to use the official components directory.

### Fixed

- Active Header JSX issue.
- Production build after foundation cleanup.

## [0.1.0] - 2026-06-24

### Added

- Initial React + Vite + TypeScript project setup.
- Styled Components setup.
- Initial theme tokens.
- Global styles.
- Initial Header and Hero implementation.
- Initial project README and placeholder documentation structure.
