# Architecture

Archives VI uses React, Vite, TypeScript and Styled Components.

The official components folder is `src/components`. New shared UI, layout and
feature components should be created there and imported from there.

The generated legacy UI folder under `src/app/components/ui` is kept untouched
for now, but it is not the primary design system. Styled Components and the
tokens from `src/styles/theme.ts` are the official styling foundation.
