# Project State

## Current Sprint

Sprint 3: Archives VI Design System Foundation

Current mode: feature development is paused temporarily for documentation.

## Completed Components

Design System:

- Button
- Card
- Badge
- StatusBadge

Layout/Home:

- Header
- Hero
- Container

## Architecture Summary

- Stack: Next.js 16.4.0 (App Router), React 19.2.9, TypeScript (strict) and Styled Components 6.
- Routes: `/` (Home) in `src/app/page.tsx`. Root layout in `src/app/layout.tsx`.
- Styling: Styled Components is official, with an SSR registry for the App Router.
- Theme: `src/styles/theme.ts`.
- Official components directory: `src/components`.
- Official UI primitives directory: `src/components/ui`.
- Generated legacy UI under `src/app/components/ui` remains untouched and is excluded from typecheck.
- Next.js migration was done ahead of the Home MVP's completion (see ADR-008).

## Current Backlog

High priority:

- Define Case type.
- Add mock case data.
- Create CaseCard using Card and StatusBadge.
- Complete Home MVP modules.
- Improve responsive behavior for Header and Hero.

Medium priority:

- Create Footer.
- Create TrendingCases module.
- Create ExploreCards module.
- Plan cleanup of legacy generated UI.
- Add accessibility review checklist.

Low priority:

- Authentication requirements.
- Interactive map specification.
- Future backend integration planning.

## Known Technical Debt

- Several placeholder files remain empty.
- Home is not responsive: at 375px the page scrolls horizontally by about 477px (already present before the migration).
- Header links point to `#`; Search, Create account and Open Case have no handler.
- Font `Poppins` (theme secondary) is declared but not loaded.
- `react-day-picker` is removed; `src/app/components/ui/calendar.tsx` (legacy) can no longer resolve it. The file is not compiled.
- `node_modules/` is tracked by git even though it is in `.gitignore`.
- `robots` is set to noindex, which was inherited from the previous index.html.
- Generated legacy UI exists alongside official components.
- README has encoding issues.
- Some Home content is still hardcoded.
- Case domain types and data are not implemented yet.
- Current route constants file is empty.
- No automated tests are configured yet.

## Next Sprint

Recommended Sprint 4: Home MVP Data and Components

Sprint goals:

- Define the Case domain model.
- Add typed mock case data.
- Create CaseCard.
- Integrate design system primitives into Home modules.
- Add Footer.
- Improve responsive behavior and accessibility.

Definition of Done:

- Build passes.
- Home remains visually consistent.
- New components use Styled Components and theme tokens.
- Documentation is updated for any new component or decision.
