# Changelog

All notable changes to Archives VI will be documented in this file.

The project follows Semantic Versioning and Conventional Commits.

## [Unreleased]

### Added
- `/meu-perfil`: área pessoal demonstrativa (ADR-021), com identidade, edição de nome e bio com validação e aviso de que nada é salvo, e cinco abas: Visão geral, Teorias e publicações, Investigações, Evidências e Atividade (solicitações, conexões, respostas e notificações). Layout ajustado à referência visual: cabeçalho com identidade, patente em cartão próprio, Aguardando sua ação, Atividade recente e colunas laterais. Evidências, respostas e investigações vêm dos dados reais; solicitações, conexões e notificações são demonstrativas. Patente e conquistas são somente leitura. Sem login, backend ou persistência.
- Cabeçalho desktop: "Meu perfil" (`/meu-perfil`), oculto abaixo de 768px (ADR-012).
- `/publicacoes/investigacao/[slug]`: community area of an investigation, with theory, evidence and suggestions, discussion, location, timeline and synthesis (ADR-020). Unknown slugs return HTTP 404.
- `/investigacoes/[slug]`: editorial page of the mystery: presentation, optional YouTube video (only when a valid link exists), theory text, photographs from public evidence, and a transition to the community area.
- `/publicacoes`: unified community area of theories and investigations, with investigations and publications in separate groups (no artificial links, ADR-013).

- `/investigacoes/[slug]`: "Evidência do criador" tag on evidences whose author is the investigation's creator. It indicates provenance, not veracity.
- `/investigacoes/[slug]`: evidence images open in an expanded view inside the card, with up to five images, previous/next controls and a "1 de 3" counter. Keyboard arrows and Escape work.
- `/investigacoes/[slug]`: community evidence suggestions (demonstrative data). Accepted ones appear in the public list with their sender and the approving investigator. Pending and rejected ones never appear publicly. Accept and reject change only the current page session; nothing is saved.
- `/investigacoes/[slug]`: "Localização das evidências" section with a reference map image. It is demonstrative: it marks no real location.
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
- `/explorar`: discovery hub with the four explore tiles and "Mistérios em alta". It is in the main navigation (ADR-012).
- `/perfil/[usuario]`: tabs Visão geral, Investigações, Teorias e publicações and Conquistas, selected by `?aba=` on the client (ADR-017). Clicking a tab adds a history entry, so back and forward move between tabs. Conquistas shows a "not available yet" state, with no invented records (Investigações was filled later, see below). Profiles stay statically generated and missing ones still return HTTP 404.
- `/perfil/[usuario]`: "Investigação em destaque" block in the Visão geral, after the tabs. The choice is an automatic fallback, not the member's pick: investigations the member created come first, then those they took part in, each group by most recent update. It shows the investigation's status, hypothesis, evidence and participant counts, and links to the investigation. It is omitted when no detailed investigation involves the member. The game field is not shown, because the data has none.
- `/perfil/[usuario]`: compact contribution indicators (investigations created, theories published, evidence sent), computed from the demonstrative data.
- `/perfil/[usuario]`: header actions. "Seguir" is shown disabled with a link to `/entrar`, because following requires an account (ADR-010). A menu shows "Denunciar" and "Bloquear" disabled, with a note that moderation does not exist yet.
- `/perfil/[usuario]`: sidebar "Patente do Investigador", with the current medal in large size, the previous medals in a compact row, and demonstrative data (ADR-019). Shows an empty state when a member has no patent data.
- `/perfil/[usuario]`: sidebar "Conquistas do Investigador", with achievement names as colored labels. Demonstrative data (ADR-019). Shows an empty state when there are none.
- `/perfil/[usuario]`: the "Teorias e publicações" tab has a collapsible theme filter ("Filtrar temas" / "Ocultar filtros"), closed by default. An active theme from the URL stays applied with the panel closed.
- `/perfil/[usuario]`: the "Investigações" tab lists real investigations in two groups, "Criadas por este membro" and "Em que participa". Each item links to the investigation. Only investigations with a published detail are included. Empty groups show their own state.
- `/publicacao/[slug]`: "Curtir" and "Favoritar" as disabled buttons, with the message "Curtir e favoritar exigem conta" and a link to sign in. Nothing is saved and no count is shown.
- Thematic tags: a controlled catalog of eight themes (`src/constants/tagsTematicas.ts`, ADR-018), with the `TagTematica` component. Publication tags now use the catalog ids.
- `/publicacoes`: theme filter (`?tag=`), combined with the type filter. Unknown values are ignored. A theme with no publications shows an empty state.
- `/perfil/[usuario]`: "Contribuições recentes" list in the Visão geral: publications, public evidence, accepted community suggestions, and investigations the member created or took part in, most recent first (up to 10). Each item links to its publication or investigation, and evidence links to its anchor on the investigation page.

### Changed

- `/meu-perfil`: layout ajustado à referência visual. Cabeçalho com avatar grande, patente em cartão próprio (somente leitura) e conquistas como rótulos. Cinco abas (ADR-021, ajuste visual), com ações "+ Criar teoria" e "Abrir investigação" (ação restrita) na linha de abas. Visão geral em duas colunas, com atalhos para as abas. A aba Atividade reúne notificações, solicitações e respostas, com contador de não lidas.
- `AbasPerfil` (opções `variante="caixa"` e `acoes`) e `Avatar` (tamanho `large`) ganharam opções novas. O estilo padrão do perfil público não mudou.
- Tag audit: two theme associations were removed because they were doubtful. "letreiro" no longer maps to "Símbolos e mensagens", and "código" no longer maps to it. Their free-text terms stay in `termos`.
- Publication tags: `Publicacao.tags` now holds catalog ids. The previous free-text tags moved to `Publicacao.termos`, unchanged, and still feed the search. The publication page shows the themes as tags and the free-text terms on a separate "Palavras-chave" line. Search also matches theme names.
- `ContentGrid`: without a `sidebar`, the main column takes the full width, with no empty 320px column. Pages that pass a sidebar keep their layout.
- `/perfil/[usuario]`: the global sidebar (forum topics and updates) is no longer shown, because it has no relation to the profile. The profile content takes the full width of the page.
- `/perfil/[usuario]`: the loading state follows the profile layout (breadcrumb, identity, indicators, tabs and content) without a sidebar. Placeholders carry no data.
- Main navigation: "Explorar" (`/explorar`) added after "Teorias" (ADR-012).
- Desktop header: "Criadores" (`/criadores`) and "Criar teoria" (`/criar`) text actions added (ADR-012). They are hidden below 768px.
- Active navigation items are matched by path segment, so `/criar` is no longer marked active on `/criar-conta` or `/criadores`.
- `/investigacoes/[slug]`: the "Conexões" section is replaced by "Localização das evidências". The anchor navigation follows.
- `/investigacoes/[slug]`: the first image of each evidence card is about 40% of its previous height (604×135 px on desktop, 341×102 px on mobile). The width and `object-fit: cover` are unchanged.
- `/investigacoes/[slug]`: the reference map in "Localização das evidências" is about half its previous size (about 188px wide on desktop, 162px on mobile), keeping its proportion.
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

- Unknown profiles, investigations and publications now return a real HTTP 404 (previously HTTP 200 with a "not found" page). Verified with `curl` on a production build. Records are generated at build time from the mocks (ADR-014).
- Root "not found" page in Portuguese, used by the router for unknown dynamic segments. It renders the shared site shell (header, navigation, footer and mobile tab bar) through the new `SiteShell` component, which the `(site)` layout also uses.
- `FormField`: an `id` passed to a control inside it no longer breaks the label link. The generated id wins inside `FormField`.
- `/criar-conta`: the password hint no longer repeats the minimum-length error.
- Heading levels: publication and creator results inside `/buscar` and the profile's publications section use `h3` under their `h2` section headings. The `nivelTitulo` prop defaults to `h2`, so other pages are unchanged.
- Hero background image now comes from an import, so it is included in the production build.
- Removed empty `ui/Badge.tsx`, `ui/Button.tsx` and `ui/Card.tsx`, which shadowed the component folders.

### Removed

- `ConexoesGrafo` component and the connections data of the investigation detail, replaced by the location section.
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
