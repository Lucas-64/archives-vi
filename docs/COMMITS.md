# Commit Guidelines

Archives VI follows the Conventional Commits standard.

## Format

```txt
<type>(optional-scope): <description>
```

Examples:

```bash
feat(ui): create badge component
fix(layout): correct header closing tag
docs: document sprint backlog
refactor(home): consolidate hero component
chore: update project metadata
```

## Common Types

- `feat`: a new feature or component.
- `fix`: a bug fix.
- `docs`: documentation-only changes.
- `style`: formatting changes that do not affect behavior.
- `refactor`: code changes that do not add features or fix bugs.
- `test`: adding or updating tests.
- `chore`: maintenance tasks.
- `build`: build system or dependency changes.
- `ci`: CI/CD changes.

## Scopes

Suggested scopes:

- `ui`
- `layout`
- `home`
- `docs`
- `theme`
- `architecture`
- `data`

## Good Commit Examples

```bash
feat(ui): create reusable status badge
docs(architecture): document official components directory
fix(home): resolve hero background asset path
refactor(ui): split button styles and types
```

## Bad Commit Examples

```bash
update stuff
changes
fix bug
wip
```

## Changelog Relationship

Commit messages should be clear enough to support changelog updates. User-facing
features should be represented under `Added`, bug fixes under `Fixed`, and
breaking architectural changes under `Changed` or `Removed`.
