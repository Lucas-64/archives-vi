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

## ADR-009: Investigation Status Mapping

Decision: the investigation cards show the visible category (Em andamento,
Resolvidas, Sem fontes), mapped explicitly from the internal `Case.status` values
in `src/lib/investigacao.ts`. The planned listing `/investigacoes` will use the same
mapping for its tabs. The detail page uses a separate state
(`EstadoInvestigacao`) and a separate flag (`encerradaPeloAutor`) in
`src/types/InvestigacaoDetalhe.ts`.

Reasoning:

- Closing an investigation is an author action. It must not be read as proof,
  so it is never mapped to "Resolvidas".
- The internal statuses are kept unchanged, so existing data and types stay valid.
- `community` and `classified` have no documented meaning yet. They map to
  `null`: the record keeps its internal label. When the listing is built, these
  records must not appear in the category tabs.

Status: Accepted. Pending: the meaning and category of `community` and `classified`
(needs product approval). The listing `/investigacoes` is not built yet.

## ADR-010: Demonstrative Data and No Persistence Before Authentication

Decision: all content under `src/mocks/` is demonstrative and labeled as such in
code. Actions that need an account (follow, add evidence, vote, comment) are shown
disabled, with a link to `/entrar`. No session, API, local storage or fake persistence
is simulated. Closing an investigation is not in the interface yet; when it is added,
it must follow the same rule and be authorized on the server.

Reasoning:

- There is no backend, authentication or database yet. A simulated save would look real.
- Authorization for closing an investigation must be checked on the server, and that layer does not exist yet.
- Keeping the boundary explicit lets the data layer (`src/lib/data.ts`) be replaced without rewriting pages.

Exceções aprovadas (2026-10-16):

- `/criar` cria somente teorias, com prévia e envio simulado. A mensagem de sucesso
  declara que nada foi publicado nem salvo, e que o envio real depende de backend e conta.
- `/entrar` e `/criar-conta` são formulários demonstrativos: validam no cliente e mostram
  um aviso de que nenhuma sessão ou conta foi criada, porque o backend não existe.
  Não há sessão, cookie, armazenamento, redirecionamento para área logada nem requisição.

Interpretação: a regra de não simular envio ou login existe para evitar que uma simulação
pareça real. Essas demonstrações são rotuladas como tal e não gravam nada, por isso são
permitidas como exceção. Confirmação pendente do usuário, ver `docs/page-specs/EXECUTION_PLAN.md`, seção 9.

Status: Accepted

## ADR-011: Publication and Investigation Routes

Decision: publications (`Publicacao`) live at `/publicacao/[slug]`. Investigations
(`Case`, with optional detail in `InvestigacaoDetalhe`) live at `/investigacoes/[slug]`.
Navigation items are defined once in `src/constants/routes.ts`; items without a
functional route are marked with `href: null` and rendered without a link.

Open point: `Publicacao.tipo` accepts `"investigacao"` (`src/types/Publicacao.ts`), so
investigation-type content currently exists in both models. Evidence in the mocks:
three publications with `tipo: "investigacao"` cover the same subjects as three
`Case` records (sinal da Frequência 99.1 / `leonida-radio-loop`, bunker nos pântanos /
`everglades-bunker-rumor`, código dos adesivos da loja de penhores / `pawn-shop-sticker-code`),
with different ids and no link between them. This overlap is not decided yet and needs
product approval.

Reasoning:

- The two models have different structures (publications have no status;
  investigations have a state, evidence and synthesis), so one page would hide the difference.
- A single source for routes and navigation avoids broken links when a route is added.

Status: Accepted. Pending: the listing `/investigacoes` (the Home "Ver mais" and the
"Mistérios" navigation item point to it), and the decision on the overlap described above.

Decisões complementares (aprovadas em 2026-10-15):

- Modelos separados: `Publicacao` e `Case` continuam distintos. Publicações com `tipo: "investigacao"` continuam em `/publicacoes`, sem entrar na listagem de investigações.
- Vínculo futuro: um campo opcional `caseId` poderá relacionar uma publicação a uma investigação quando houver correspondência real. Ainda não existe nos tipos nem nos mocks.
- Aba "Todas" da listagem `/investigacoes`: inclui todos os registros `Case`, inclusive `community` e `classified`, com os rótulos existentes. Não há abas adicionais. Os status continuam mapeados como no ADR-009.
- `src/data/cases.ts` é mantido por enquanto, sem uso, até uma revisão específica.

