# ClickUp Backlog

## Backlog Format

Fields:

- Epic
- Feature
- User Story
- Acceptance Criteria
- Priority
- Suggested Sprint
- Dependencies
- Estimate

## Epic: MVP Foundation

### Feature: Home MVP Structure

User Story:

As a visitor, I want to understand what Archives VI is from the Home page so
that I can decide where to explore first.

Acceptance Criteria:

- Header communicates brand and navigation.
- Hero communicates the mystery/investigation theme.
- Home includes at least one featured case module.
- Home includes a community or trending investigation module.
- Layout is responsive.

Priority: High

Suggested Sprint: Sprint 4

Dependencies: Design System primitives, case data model

Estimate: 8 story points

### Feature: Footer

User Story:

As a visitor, I want footer links and project context so that I can understand
the site's purpose and ownership.

Acceptance Criteria:

- Footer uses official layout and typography tokens.
- Footer includes project description.
- Footer includes navigation links.
- Footer includes disclaimer for Rockstar/GTA ownership.

Priority: Medium

Suggested Sprint: Sprint 4

Dependencies: Layout foundation

Estimate: 3 story points

## Epic: Design System

### Feature: UI Primitive Indexing

User Story:

As a developer, I want consistent UI exports so that components are easy to
import and reuse.

Acceptance Criteria:

- Each primitive exports from its own `index.ts`.
- Optional barrel export strategy is documented before implementation.
- No legacy empty UI files are used as official primitives.

Priority: Medium

Suggested Sprint: Sprint 4

Dependencies: Existing primitives

Estimate: 2 story points

### Feature: CaseCard Component

User Story:

As a visitor, I want case cards to summarize mysteries clearly so that I can
scan investigations quickly.

Acceptance Criteria:

- CaseCard uses Card, Badge or StatusBadge.
- Displays title, summary, status and metadata.
- Accepts typed case data.
- Has hover and focus states where interactive.

Priority: High

Suggested Sprint: Sprint 4

Dependencies: Case type, Card, StatusBadge

Estimate: 5 story points

## Epic: Case Domain

### Feature: Case Type Definition

User Story:

As a developer, I want a typed case model so that case UI can be built safely.

Acceptance Criteria:

- `Case` type includes id, title, summary, status, category and metadata.
- Status values align with StatusBadge.
- Type is documented or self-explanatory.

Priority: High

Suggested Sprint: Sprint 4

Dependencies: StatusBadge status list

Estimate: 3 story points

### Feature: Mock Case Data

User Story:

As a developer, I want mock case data so that Home and case components can be
developed before backend integration.

Acceptance Criteria:

- Mock data uses the official Case type.
- Data includes multiple statuses.
- Data avoids copyrighted claims presented as factual game content.

Priority: High

Suggested Sprint: Sprint 4

Dependencies: Case type

Estimate: 3 story points

## Epic: Community

### Feature: Trending Topics Module

User Story:

As a visitor, I want to see active community theories so that I can discover
what people are investigating.

Acceptance Criteria:

- Module displays topic title, count and status/category.
- Uses design system components.
- Data source can be mocked initially.

Priority: Medium

Suggested Sprint: Sprint 5

Dependencies: Card, Badge, mock data

Estimate: 5 story points

## Epic: Authentication

### Feature: Authentication Requirements

User Story:

As a product owner, I want authentication requirements documented so that
implementation can be planned safely later.

Acceptance Criteria:

- Login, signup and profile requirements are documented.
- Role model is drafted.
- Backend dependency is identified.

Priority: Low

Suggested Sprint: Future

Dependencies: Backend decision

Estimate: 3 story points

## Epic: Interactive Map

### Feature: Map Discovery Specification

User Story:

As a product owner, I want the map experience specified before implementation
so that scope is controlled.

Acceptance Criteria:

- Map user journeys are documented.
- Marker data requirements are defined.
- Performance and mobile risks are listed.

Priority: Medium

Suggested Sprint: Future

Dependencies: Case model, location model

Estimate: 5 story points

## Epic: Technical Debt

### Feature: Legacy UI Cleanup Plan

User Story:

As a developer, I want a cleanup plan for generated legacy UI so that the
official architecture stays clear.

Acceptance Criteria:

- Identify which generated files are unused.
- Confirm no active imports depend on deleted files.
- Remove legacy files only in a dedicated cleanup task.

Priority: Medium

Suggested Sprint: Sprint 5

Dependencies: Stable official design system

Estimate: 5 story points
