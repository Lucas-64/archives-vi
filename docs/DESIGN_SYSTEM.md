# Design System

## Purpose

The Archives VI Design System provides reusable UI primitives for the MVP while
preserving the visual identity inspired by GTA VI, Rockstar Games and The
X-Files.

The system exists to:

- Keep UI consistent across the platform.
- Reduce duplicated component styling.
- Improve development speed.
- Support accessibility and TypeScript safety.
- Prepare the project for larger features and future migration work.

Styled Components is the official styling approach. Components should use the
theme tokens from `src/styles/theme.ts` instead of hard-coded values whenever a
matching token exists.

## Component Structure

Official UI primitives use a folder-based structure:

```txt
src/components/ui/ComponentName/
  ComponentName.tsx
  ComponentName.styles.ts
  ComponentName.types.ts
  index.ts
```

## Button

`Button` is the official reusable action primitive.

Capabilities:

- Accepts native button props.
- Supports children.
- Supports disabled state.
- Supports loading state.
- Supports typed variants and sizes.

Variants:

- `primary`: main call to action with the Archives VI pink/purple gradient.
- `secondary`: supporting action with a dark filled surface.
- `outline`: lower-emphasis action with a visible border.
- `ghost`: subtle action for low-emphasis UI.

Sizes:

- `small`
- `medium`
- `large`

Usage:

```tsx
import { Button } from "../components/ui/Button";

export function Example() {
  return (
    <Button variant="primary" size="medium" onClick={() => undefined}>
      Open Case
    </Button>
  );
}
```

## Card

`Card` is the official reusable surface primitive. It groups related content
such as cases, investigation summaries, forum previews and dashboard modules.

Capabilities:

- Accepts native div props.
- Supports children.
- Supports optional hover effect.
- Supports typed variants and padding sizes.

Variants:

- `default`: standard dark surface with border.
- `elevated`: dark surface with the project card shadow.
- `outlined`: transparent surface with border only.
- `glass`: translucent surface for layered mystery/investigation UI.

Padding:

- `none`
- `small`
- `medium`
- `large`

Usage:

```tsx
import { Card } from "../components/ui/Card";

export function Example() {
  return (
    <Card variant="elevated" padding="large" hoverable>
      <h2>UFO spotted over Leonida?</h2>
      <p>Community investigators are gathering evidence.</p>
    </Card>
  );
}
```

## Badge

`Badge` is the official reusable label primitive. It is used for compact status,
category and metadata labels across cases, theories and investigations.

Capabilities:

- Accepts native span props.
- Supports children.
- Supports optional uppercase text.
- Supports optional dot indicator.
- Supports typed variants and sizes.

Variants:

- `default`: neutral metadata label.
- `primary`: branded Archives VI accent label.
- `secondary`: supporting dark surface label.
- `success`: confirmed or positive state.
- `warning`: investigating or caution state.
- `danger`: debunked, rejected or destructive state.
- `info`: unexplained or informational state.

Sizes:

- `small`
- `medium`

Usage:

```tsx
import { Badge } from "../components/ui/Badge";

export function Example() {
  return (
    <Badge variant="warning" size="medium" uppercase dot>
      Investigating
    </Badge>
  );
}
```

## StatusBadge

`StatusBadge` is a semantic wrapper around `Badge` for case and investigation
states. It automatically maps each supported status to a badge variant, label
and icon.

Statuses:

- `investigating`: yellow indicator, `warning`
- `confirmed`: green indicator, `success`
- `debunked`: red indicator, `danger`
- `classified`: purple indicator, `secondary`
- `community`: blue indicator, `info`

Capabilities:

- Uses Badge internally.
- Does not duplicate Badge styles.
- Supports label override.
- Supports Badge size.
- Supports uppercase rendering.

Usage:

```tsx
import { StatusBadge } from "../components/ui/StatusBadge";

export function Example() {
  return <StatusBadge status="confirmed" label="Verified" />;
}
```

## Component Philosophy

- Prefer composition over one-off styling.
- Keep components small, typed and predictable.
- Keep styling close to the component but separated into `.styles.ts`.
- Avoid adding dependencies for primitives that can be built with the current
  stack.
- Build primitives before building new pages.

---

# Page Recipes, Layout and States

This section documents the rules agreed from the approved prototype
(Início, Publicação, Criar publicação, Investigações). Routes without a
prototype follow the same components and tokens; see "Routes without prototype".

## Typography

- Display (Barlow Condensed, 600/700/800): page titles, section titles and
  the logo wordmark. Exposed as `theme.fonts.display`.
- Body (Inter, 300 to 600): text, metadata, labels and controls.
- Poppins stays declared in the theme as `theme.fonts.secondary` and is not used.

## Layout Shell

Shared by every public route through the `(site)` route group:

- Header in two rows: logo and subtitle on the left, search and sign-in actions on the right.
- Main navigation below the header, uppercase labels, pink underline on the active item.
- Content area with a main column and a 320px sidebar on desktop.
- Footer at the bottom of the content.

Navigation labels (approved): Início → `/`, Mistérios → `/investigacoes`,
Teorias → `/publicacoes`. Mapa, Galeria and Fórum keep the prototype appearance
but have no link yet (rendered with `aria-disabled`). The online counter sits on
the right of the navigation bar and uses a demonstrative value
(`src/mocks/atividade.ts`); there is no real-time presence yet.
Explorar and Criadores are reached from the Home blocks.

## Page Recipes

- **Início**: hero card with carousel dots; "Explorar" tiles (4 cards);
  "Mistérios em alta" row; sidebar with "Últimos tópicos do fórum" and
  "Atualizações recentes".
- **Publicação (detalhe)**: breadcrumb, badges, title, author line, media
  block, "A hipótese", "As evidências" (tags and counts), "Comentários"; sidebar
  with "Sobre o autor" and "Relacionados".
- **Criar publicação**: form column with title, type (Teoria or Investigação),
  body, tags, images and video; side column with a preview card.
- **Investigações**: page title and description, category tabs (Em andamento,
  Resolvidas, Sem fontes), grid of investigation cards, "Temas em alta" chips.

## Investigation Status Mapping

The UI shows three categories. The internal `StatusBadgeStatus` values stay unchanged.
The mapping is explicit in `src/lib/investigacao.ts`.

| Visible category | Internal statuses | Badge variant |
|---|---|---|
| Em andamento | `investigating` | warning |
| Resolvidas | `confirmed`, `debunked` | success / danger |
| Não mapeado (pendente de validação) | `community`, `classified` | info / secondary |

- Color follows the internal status. The text shows the category when mapped.
- `community` and `classified` are NOT assigned to "Sem fontes" yet. Their meaning
  is not documented, so they keep their internal label ("Comunidade", "Classificado")
  and do not appear in the category tabs. Decision needed: their meaning and category.
- Mock data affected: 3 of 7 investigations (`leonida-radio-loop`, `downtown-mural-symbols`,
  `airport-runway-markings`).

`StatusBadge` shows a colored dot (`Badge dot`) instead of emoji icons.

## Responsiveness

Breakpoints from `theme.breakpoints`:

- Up to 767px (mobile): single column. Sidebar moves below the main content.
  The navigation becomes a fixed bottom tab bar (`MobileTabBar`).
- 768px to 1023px (tablet): main column with a narrower sidebar.
- 1024px and up (desktop): full layout as in the prototype.

Rules: no horizontal scroll at 375px. Text and cards must wrap, never overflow.

## States

- **Loading**: `Skeleton` blocks with the same size as the final content.
- **Empty**: `EmptyState` with a title, one sentence, and an action when one exists.
- **Error**: `ErrorState` with a title, one sentence and a "Tentar de novo" button.

## Forms

- Client-side validation only. Required fields and length limits are checked in the browser.
- No backend exists yet. Submitting simulates the request and shows a clear
  success message stating that nothing was saved permanently.

## Routes Without Prototype

Explorar, Criadores, Busca, Perfil, Entrar and Criar conta have no approved
mockup. They use the same shell, tokens, Card, Badge, Button, EmptyState and
Skeleton. They must not introduce new colors, fonts or visual patterns.

---

# Shared Components Added with the Investigation Page

These components are stable and reusable. They are documented here because other pages will use them.

## Avatar

`Avatar` (`src/components/ui/Avatar`) shows a person as initials on a neutral surface.

- Sizes: `small` (28px) and `medium` (40px, default).
- Derives up to two initials from `nome`. Accepts native span props.
- Decorative (`aria-hidden`): the visible name must be rendered next to it.
- A real image can be added later through the same component.

## AcaoRestrita

`AcaoRestrita` (`src/components/acoes/AcaoRestrita.tsx`) shows an action that requires authentication.

- Renders a disabled `Button` with a message and a link to `/entrar`.
- Never simulates the action. Use it for follow, add evidence, vote, comment and close actions until sign-in exists.

## ComposerBloqueado

`ComposerBloqueado` (`src/components/comentarios/ComposerBloqueado.tsx`) is the disabled comment composer.

- Used by publication comments and by the investigation discussion.
- Nothing is saved. The link points to `/entrar`.

## Typography Token: mono

`theme.fonts.mono` is a system monospace stack (no web font is loaded). Use it for identifiers such as `EVIDÊNCIA #001`.

---

# Form Foundation and Creator Card

These components are not used by any page yet. Their behavior in the browser has not been verified.

## Input

`Input` (`src/components/ui/Input`) is the single-line text field.

- Accepts native input props. Minimum height 44px and font size 16px, which avoids zoom on iOS.
- `invalid` shows the error border (`theme.colors.debunked`) and sets `aria-invalid`.
- Inside `FormField`, it receives `id`, `aria-describedby`, `aria-invalid` and `required` from the context.
- Outside `FormField`, the caller must provide an accessible name.

## Textarea

`Textarea` (`src/components/ui/Textarea`) follows the same rules as `Input`, with a minimum height of 120px and vertical resize only.

## FormField

`FormField` (`src/components/ui/FormField`) wraps one control with a visible label.

- Props: `label` (required), `hint`, `error` and `required`.
- Generates the control `id`, links the label to the control, and links `aria-describedby` to the hint and error messages.
- The required marker is `aria-hidden`. `required` is applied to the control.
- Pages should use `noValidate` on forms, so native browser validation does not replace the Portuguese messages.
- Inside `FormField`, the generated id always wins. An `id` passed directly to the control is ignored, so the label always stays linked. Outside `FormField`, the `id` prop is used as given.
- History: until 2026-10-16, an `id` passed inside `FormField` replaced the generated id and broke the label link. Fixed in `src/components/ui/FormField/FormField.context.ts`. Check: `docs/page-specs/EXECUTION_PLAN.md`, seção 4, fase 1.
- Do not use the legacy `FormField` in `src/app/components/ui/form.tsx` (ADR-006).

## CreatorCard

`CreatorCard` (`src/components/cards/CreatorCard.tsx`) shows one creator in a list.

- Receives `criador: Criador`. Shows `Avatar`, name, `@usuario` and bio inside a hoverable `Card`.
- The name links to `ROUTES.perfil(usuario)`.
- Shows no counts and no actions.
- The name is an `h2`, as in `PublicationCard`. The page should adjust the heading level if needed.

---

# Phase 2 Page Components

Components created for the phase 2 routes. Each is in the folder of its domain. None of them stores or sends data.

- `src/components/criar/`: `CriarTeoria` (state of the page), `FormularioTeoria` (form with simulated submission), `PreviaTeoria` (live preview, same look as `PublicationCard` but without a link), `validarTeoria.ts` (pure validation and limits).
- `src/components/auth/`: `AuthCard` (card with title and footer), `AvisoDemonstracao` (persistent notice and result message labeled "Demonstração"), `AuthCardSkeleton`, `FormularioEntrar`, `FormularioCriarConta`, `validacao.ts` (pure e-mail check and password minimum).
- `src/components/busca/`: `BuscaForm` (GET form with `q`), `ResultadosBusca` (result groups). Logic in `src/lib/busca.ts`.
- `src/components/perfil/`: `ProfileHeader` (avatar, name, user and bio), `PublicacoesSecao` (publications list or empty state). Lookup in `src/lib/criadores.ts`.

Shared card props added in phase 2.1:

- `PublicationCard` and `CreatorCard` accept `nivelTitulo` (`2` or `3`, default `2`). Use `3` when the card is under an `h2` section heading, as in search results and the profile.
- `src/lib/texto.ts` (`normalizarParaBusca`) lowercases and removes accents for comparisons. Use it in any text search. It does not change the displayed text.

Rules that apply to all of them:

- Demonstrative forms say what does not happen: no session, no account, nothing saved.
- Validation runs in the browser, with messages in Portuguese linked to each field.

# Section Images and Visual Themes

- Section images are registered in `src/constants/imagensSecoes.ts` (`IMAGENS_SECOES`). Components read them through `imagemDaSecao()` and never hardcode image paths.
- Each section is tagged with a visual theme: `dia` (galeria, mapa) or `noite` (misterios, teorias). The tag is metadata only. Nothing switches themes automatically yet.
- A `null` entry means the file is not available and the tile renders without media. All four section images are registered: `misterys_night.jpg` (misterios), `teory_night.jpg` (teorias), `galery_day.jpg` (galeria) and `map_day.jpg` (mapa).
- Explore tiles: full-bleed background image (`object-fit: cover`) with a bottom-only gradient so the text stays readable. Icons are pink line icons without glow.
- Section images are decorative (`alt=""`). They must never fill user content such as publications, evidence, comments or galleries.
- The "Explorar" tiles are the reference for section cards with a background image.

