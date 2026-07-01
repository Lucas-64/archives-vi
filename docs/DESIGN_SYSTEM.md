# Design System

The Archives VI Design System provides reusable UI primitives for the MVP while
preserving the visual identity inspired by GTA VI, Rockstar Games and The
X-Files.

Styled Components is the official styling approach. Components should use the
theme tokens from `src/styles/theme.ts` instead of hard-coded values whenever a
matching token exists.

## Button

`Button` is the first official reusable UI primitive. It supports native button
props, disabled state, loading state, variants and sizes.

### Variants

- `primary`: main call to action with the Archives VI pink/purple gradient.
- `secondary`: supporting action with a dark filled surface.
- `outline`: lower-emphasis action with a visible border.
- `ghost`: subtle action for low-emphasis UI.

### Sizes

- `small`
- `medium`
- `large`

### Usage

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

`Card` is the official reusable surface primitive. It should be used to group
related content such as cases, investigation summaries, forum previews and
dashboard-style modules.

### Variants

- `default`: standard dark surface with border.
- `elevated`: dark surface with the project card shadow.
- `outlined`: transparent surface with border only.
- `glass`: translucent surface for layered mystery/investigation UI.

### Padding

- `none`
- `small`
- `medium`
- `large`

### Usage

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
