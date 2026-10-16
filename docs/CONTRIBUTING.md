# Contributing Guide

## Project Standards

Archives VI is a Next.js (App Router) + React + TypeScript project using
Styled Components. See ADR-008 in `docs/DECISIONS.md`.

Primary rules:

- Use `src/components` for official components.
- Use Styled Components for official component styling.
- Use theme tokens from `src/styles/theme.ts`.
- Do not add dependencies without a documented reason.
- Do not create new pages outside the scope approved for the current task and recorded in `docs/PROJECT_STATE.md`.
- Prefer reusable components over one-off UI.
- Keep generated legacy UI untouched unless a task explicitly targets it.

## Coding Standards

- Use TypeScript for all React components.
- Use PascalCase for component names.
- Use folder-based structure for design system primitives.
- Split component logic, styles and types for reusable UI primitives.
- Accept native HTML props where appropriate.
- Keep components focused on a single responsibility.
- Avoid hard-coded colors, spacing and typography when theme tokens exist.
- Prefer semantic HTML.
- Include accessible labels, roles or aria attributes when needed.

## Branch Strategy

Recommended branch naming:

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `refactor/<short-description>`
- `chore/<short-description>`

Examples:

- `feature/status-badge`
- `docs/project-documentation`
- `refactor/home-components`

## Commit Convention

This project follows Conventional Commits.

Examples:

```bash
feat: create reusable card component
fix: correct header jsx structure
docs: add project roadmap
refactor: consolidate home components
chore: update dependencies metadata
```

## Pull Request Workflow

Each pull request should include:

- Summary of changes.
- Reason for the change.
- Screenshots for visual UI changes.
- Validation steps.
- Known risks or follow-up tasks.

Recommended checklist:

- [ ] Code follows the current architecture.
- [ ] Styled Components use theme tokens.
- [ ] New reusable UI is documented.
- [ ] Build passes.
- [ ] No unnecessary dependencies were added.
- [ ] Scope is limited to the task.

## Definition of Done

A task is done when:

- The requested scope is implemented or documented.
- TypeScript/build validation passes when code changed.
- Documentation is updated when architecture or design system behavior changes.
- The final response lists changed files and validation results.
