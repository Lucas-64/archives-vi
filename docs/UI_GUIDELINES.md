# UI Guidelines

## Visual Identity

Archives VI should feel like a premium mystery archive for GTA VI discoveries:
dark, investigative, neon-accented and community-driven.

The visual language is inspired by:

- GTA VI promotional color energy.
- Rockstar Games confidence and editorial polish.
- The X-Files atmosphere.
- Classified documents and case boards.
- Classic gaming community archives.

## Color System

Use theme tokens from `src/styles/theme.ts`.

Core colors:

- Background: `#090B12`
- Secondary background: `#111827`
- Card surface: `#141A24`
- Border: `#232B3A`
- Pink accent: `#FF4FA3`
- Purple accent: `#9C4DFF`
- Primary text: `#F4F4F4`
- Secondary text: `#A1A1AA`

Status colors:

- Investigating: `#FBBF24`
- Confirmed: `#10B981`
- Debunked: `#EF4444`
- Unexplained/info: `#3B82F6`
- Legendary: `#F59E0B`

Guidelines:

- Use dark surfaces as the foundation.
- Use pink and purple for brand emphasis.
- Use status colors only for state communication.
- Avoid creating new one-off colors unless the theme is updated first.

## Typography

Theme fonts (approved in the prototype review):

- Display (headings, page titles, section titles): Barlow Condensed, weights 600, 700 and 800, uppercase where the prototype uses it.
- Body (text, labels, controls): Inter, weights 300 to 600.
- Secondary: Poppins is declared in the theme but not used by any page.

Guidelines:

- Use clear hierarchy.
- Keep headings bold, condensed and direct.
- Use secondary text for metadata and descriptions.
- Avoid oversized text inside compact cards and controls.
- Do not use negative letter spacing.

## Spacing

Use the theme spacing scale:

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px
- `section`: 96px

Guidelines:

- Prefer consistent spacing over visual guessing.
- Use larger spacing for page sections.
- Use compact spacing for badges, metadata and toolbar-like UI.
- Preserve readable gaps between investigative content blocks.

## Shape and Surfaces

Use theme radius tokens:

- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px
- `pill`: 999px

Guidelines:

- Cards may use larger radius for atmospheric surfaces.
- Buttons should remain clear and action-oriented.
- Badges should generally use pill radius.
- Avoid deeply nested card layouts.

## Component Philosophy

- Build reusable primitives before feature-specific UI.
- Keep components focused and composable.
- Use variants for meaningful differences, not visual experiments.
- Prefer semantic props such as `variant`, `size`, `status` and `padding`.
- Avoid duplicating styles from existing primitives.

## Accessibility

Guidelines:

- Use semantic HTML first.
- Buttons must use `type="button"` unless used for form submission.
- Interactive elements must have visible focus states.
- Icons that are decorative should use `aria-hidden="true"`.
- Statuses should include readable text, not color alone.
- Maintain sufficient color contrast against dark backgrounds.

## Responsive Design

Breakpoints:

- Mobile: 768px
- Tablet: 1024px
- Desktop: 1280px

Guidelines:

- Design mobile layouts intentionally.
- Avoid fixed widths that break on smaller screens.
- Use grid and flex layouts for responsive composition.
- Ensure text does not overflow buttons, cards or badges.
