# Sprint Plan

## Completed Sprints

### Sprint 1: Project Foundation

Goal: establish the initial technical foundation and visual direction.

Completed:

- React + Vite + TypeScript project exists.
- Styled Components configured.
- Theme tokens created.
- Global styles created.
- Initial Header and Hero created.

### Sprint 2: Foundation Cleanup

Goal: stabilize the official architecture before expanding implementation.

Completed:

- `src/components` selected as official components directory.
- Active Header and Hero consolidated into official folder.
- Header JSX issue fixed.
- Architecture documentation started.
- Build validated.

## Current Sprint

### Sprint 3: Design System Foundation

Goal: create reusable UI primitives before building more pages.

Completed:

- Button
- Card
- Badge
- StatusBadge
- Design system documentation
- Architecture decisions documentation

Current focus:

- Documentation and project management package.

## Next Sprint

### Sprint 4: Home MVP Data and Components

Sprint Goal:

Create the typed data and reusable Home components needed to turn the current
Home page into an MVP foundation.

Sprint Backlog:

- Define Case type.
- Add typed mock case data.
- Create CaseCard using Card and StatusBadge.
- Implement ExploreCards section.
- Implement TrendingCases section.
- Create Footer.
- Improve Header and Hero responsiveness.

## Definition of Ready

A task is ready when:

- Scope is clear.
- Acceptance criteria are defined.
- Dependencies are known.
- Required design system primitives exist or are part of the task.
- No architecture decision is blocking the work.

## Definition of Done

A task is done when:

- Implementation or documentation matches the acceptance criteria.
- TypeScript build passes if code changed.
- Styled Components use theme tokens.
- Documentation is updated when design system or architecture changes.
- No unrelated files are modified.
- Final summary lists changed files and validation.

## Sprint Ceremony Suggestions

- Sprint Planning: select tasks from Ready status only.
- Daily Scrum: review blockers, dependencies and scope risk.
- Backlog Refinement: split future features into smaller implementation tasks.
- Sprint Review: demo working UI or review completed documentation.
- Retrospective: capture technical debt and workflow improvements.
