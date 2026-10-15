# Sprint Log

## Sprint 1: Project Foundation

Status: Completed

Focus:

- Establish the initial React + Vite + TypeScript project.
- Configure Styled Components.
- Create the first theme tokens.
- Add the initial Header and Hero sections.
- Define the early product direction for Archives VI.

Completed:

- Project scaffold exists.
- `ThemeProvider` configured.
- `GlobalStyle` configured.
- Initial `theme.ts` created.
- Initial Home visual direction established.

Notes:

- The project contained generated and imported UI assets that required later
  cleanup.

## Sprint 2: Foundation Cleanup

Status: Completed

Focus:

- Stabilize the active app structure.
- Confirm `src/components` as the official components folder.
- Keep generated legacy UI folders untouched.
- Document the architecture decision.

Completed:

- Active `App.tsx` imports were updated to use `src/components`.
- Active Header and Hero were consolidated into `src/components`.
- Header JSX issue was fixed.
- `docs/ARCHITECTURE.md` received the first architecture note.
- Production build was validated.

Notes:

- Legacy generated UI under `src/app/components/ui` remains in the repository
  but is not the official design system.

## Sprint 3: Design System Foundation

Status: In Progress

Focus:

- Build reusable UI primitives before expanding pages.
- Document design system decisions.
- Avoid replacing current Home UI until primitives are stable.

Completed:

- Button component created.
- Card component created.
- Badge component created.
- StatusBadge component created using Badge internally.
- `docs/DESIGN_SYSTEM.md` updated with component documentation.
- `docs/DECISIONS.md` created with architecture decisions.

Notes:

- Current sprint is temporarily paused for documentation hardening before new
  implementation work continues.

## Documentation Sprint

Status: In Progress

Focus:

- Create production-quality project documentation.
- Support both software engineering and Scrum Master portfolio review.
- Align roadmap, backlog, architecture and project state.

Planned outputs:

- Project vision.
- Roadmap.
- Sprint log.
- Changelog.
- Architecture documentation.
- Design system documentation.
- Decisions log.
- Contributing guide.
- Commit guide.
- UI guidelines.
- ClickUp-style backlog.
- Project state snapshot.
