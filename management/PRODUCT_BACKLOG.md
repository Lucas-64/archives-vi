# Product Backlog

This backlog reflects the current repository state and the agreed delivery
strategy for Archives VI. Completed items are marked as `Done` only when the
work exists in the repository. Planned work is marked as `Ready`, `Backlog` or
`Planned`.

## Epic: Design System Foundation

### Feature: Button Primitive

User Story:

As a developer, I want a reusable Button component so that actions remain
consistent across the app.

Acceptance Criteria:

- Supports native button props.
- Supports variants: primary, secondary, outline and ghost.
- Supports sizes: small, medium and large.
- Supports disabled and loading states.
- Uses Styled Components and theme tokens.
- Exports from `src/components/ui/Button/index.ts`.

Priority: High

Story Points: 5

Dependencies: Theme setup, Styled Components setup

Suggested Sprint: Sprint 3

Status: Done

### Feature: Card Primitive

User Story:

As a developer, I want a reusable Card component so that content surfaces remain
consistent across cases, theories and community modules.

Acceptance Criteria:

- Supports native div props.
- Supports variants: default, elevated, outlined and glass.
- Supports padding sizes: none, small, medium and large.
- Supports optional hover effect.
- Uses Styled Components and theme tokens.
- Exports from `src/components/ui/Card/index.ts`.

Priority: High

Story Points: 5

Dependencies: Theme setup, Styled Components setup

Suggested Sprint: Sprint 3

Status: Done

### Feature: Badge and StatusBadge

User Story:

As a user, I want clear visual labels for case states so that I can quickly
understand the status of an investigation.

Acceptance Criteria:

- Badge supports variants: default, primary, secondary, success, warning,
  danger and info.
- Badge supports sizes: small and medium.
- Badge supports uppercase text and dot indicator.
- StatusBadge reuses Badge internally.
- StatusBadge supports investigating, confirmed, debunked, classified and
  community.
- Components are documented in the Design System.

Priority: High

Story Points: 8

Dependencies: Badge primitive for StatusBadge

Suggested Sprint: Sprint 3

Status: Done

### Feature: SectionTitle Component

User Story:

As a developer, I want a reusable SectionTitle component so that Home sections
use consistent headings, descriptions and optional metadata.

Acceptance Criteria:

- Supports title and optional eyebrow/description.
- Uses Styled Components and theme tokens.
- Supports responsive text sizing.
- Can be reused by Explore Cards, Featured Cases, Latest Theories and Community
  Activity sections.

Priority: High

Story Points: 3

Dependencies: Theme tokens, typography guidelines

Suggested Sprint: Sprint 4

Status: Ready

## Epic: Home MVP

### Feature: Case Type Definition

User Story:

As a developer, I want a typed case model so that Home and future case features
can safely consume case data.

Acceptance Criteria:

- `Case` type includes id, title, summary, status, category and metadata.
- Status values align with StatusBadge.
- Type is exported from `src/types`.
- Type supports future case detail expansion.

Priority: High

Story Points: 3

Dependencies: StatusBadge status list

Suggested Sprint: Sprint 4

Status: Ready

### Feature: Mock Case Data

User Story:

As a developer, I want typed mock case data so that Home MVP sections can be
built before backend integration.

Acceptance Criteria:

- Mock data uses the official Case type.
- Data includes multiple statuses.
- Data can power CaseCard and Home sections.
- Content is clearly fictional or safe for portfolio use.

Priority: High

Story Points: 3

Dependencies: Case Type Definition

Suggested Sprint: Sprint 4

Status: Ready

### Feature: CaseCard Component

User Story:

As a visitor, I want compact case summaries so that I can scan mysteries before
opening a detail view.

Acceptance Criteria:

- Uses Card and StatusBadge.
- Displays title, summary, status and metadata.
- Accepts typed Case data.
- Supports hover and focus states if interactive.
- Uses Styled Components and theme tokens.

Priority: High

Story Points: 5

Dependencies: Case Type Definition, Mock Case Data, Card, StatusBadge

Suggested Sprint: Sprint 4

Status: Ready

### Feature: Explore Cards Section

User Story:

As a visitor, I want quick exploration entry points so that I can choose between
cases, theories, map content and community areas.

Acceptance Criteria:

- Displays a set of exploration cards.
- Uses Card and SectionTitle where appropriate.
- Cards are responsive.
- Visual style matches Archives VI identity.

Priority: High

Story Points: 5

Dependencies: Card, SectionTitle

Suggested Sprint: Sprint 4

Status: Backlog

### Feature: Featured Cases Section

User Story:

As a visitor, I want to see highlighted investigations so that the most
important mysteries are easy to find.

Acceptance Criteria:

- Displays featured cases from mock case data.
- Uses CaseCard or a feature-specific composition built from Card and
  StatusBadge.
- Supports at least one primary featured case.
- Maintains responsive layout.

Priority: High

Story Points: 5

Dependencies: CaseCard, Mock Case Data, SectionTitle

Suggested Sprint: Sprint 4

Status: Backlog

### Feature: Latest Theories Section

User Story:

As a visitor, I want to see recent theories so that I can understand what the
community is currently discussing.

Acceptance Criteria:

- Displays latest theory summaries using mocked data.
- Shows topic title, short description and activity metadata.
- Uses Card, Badge or StatusBadge where appropriate.
- Does not require authentication.

Priority: Medium

Story Points: 5

Dependencies: Card, Badge, mocked theory data

Suggested Sprint: Sprint 5

Status: Backlog

### Feature: Community Activity Section

User Story:

As a visitor, I want to see community activity so that the site feels active and
investigation-driven.

Acceptance Criteria:

- Displays community stats or recent activity.
- Uses Card and Badge primitives.
- Clearly separates mock activity from future live data.
- Layout works on desktop and mobile.

Priority: Medium

Story Points: 5

Dependencies: Card, Badge, mock community data

Suggested Sprint: Sprint 5

Status: Backlog

### Feature: Footer Component

User Story:

As a visitor, I want footer links and project context so that I can understand
the site's purpose, navigation and ownership disclaimer.

Acceptance Criteria:

- Footer uses Styled Components and theme tokens.
- Includes project description.
- Includes navigation links.
- Includes portfolio/educational disclaimer.
- Matches current visual identity.

Priority: Medium

Story Points: 3

Dependencies: Layout foundation

Suggested Sprint: Sprint 4

Status: Backlog

### Feature: Home Responsiveness Pass

User Story:

As a visitor on mobile or tablet, I want the Home page to remain readable and
usable so that I can explore the site on any device.

Acceptance Criteria:

- Header navigation does not overflow.
- Hero layout stacks correctly on mobile.
- Cards and sections adapt to small screens.
- Text does not overlap or become unreadable.
- Build passes after layout changes.

Priority: High

Story Points: 5

Dependencies: Home MVP sections, Header, Hero

Suggested Sprint: Sprint 4

Status: Backlog

## Epic: Product Management

### Feature: Configure ClickUp Workspace

User Story:

As a Scrum Master, I want a structured ClickUp workspace so that delivery,
risks, releases and documentation can be managed clearly.

Acceptance Criteria:

- Space, folders and lists are configured from `CLICKUP_STRUCTURE.md`.
- Statuses include Backlog, Ready, In Progress, Code Review, Testing, Done and
  parallel Blocked.
- Custom fields include Epic, Sprint, Release, Owner, Story Points and Definition
  of Done.

Priority: High

Story Points: 3

Dependencies: CLICKUP_STRUCTURE.md

Suggested Sprint: Documentation Sprint

Status: Ready

### Feature: Import Backlog into ClickUp

User Story:

As a Scrum Master, I want the project backlog imported into ClickUp so that work
can be tracked from a single tool.

Acceptance Criteria:

- CSV imports successfully.
- Completed work is marked Done.
- Current and upcoming work is marked Ready or Backlog.
- Imported fields map to the agreed custom fields.

Priority: High

Story Points: 3

Dependencies: Configure ClickUp Workspace, CLICKUP_IMPORT.csv

Suggested Sprint: Documentation Sprint

Status: Backlog

### Feature: Define Sprint Workflow

User Story:

As a Scrum Master, I want a clear sprint workflow so that work moves from
Backlog to Done consistently.

Acceptance Criteria:

- Workflow statuses are documented.
- Definition of Ready is documented.
- Definition of Done is documented.
- Blocked work handling is documented.

Priority: High

Story Points: 2

Dependencies: CLICKUP_STRUCTURE.md, SPRINT_PLAN.md

Suggested Sprint: Documentation Sprint

Status: Ready

### Feature: Create SM Portfolio View

User Story:

As a portfolio reviewer, I want a dedicated Scrum Master view so that planning,
risk, documentation and delivery artifacts are easy to evaluate.

Acceptance Criteria:

- View highlights planning, sprint, risk and documentation tasks.
- View includes portfolio-relevant tags.
- View is described in ClickUp structure documentation.

Priority: Medium

Story Points: 2

Dependencies: Configure ClickUp Workspace

Suggested Sprint: Documentation Sprint

Status: Backlog

### Feature: Connect GitHub to ClickUp if Available

User Story:

As a Scrum Master, I want GitHub connected to ClickUp when available so that
commits and delivery activity can be traced to tasks.

Acceptance Criteria:

- GitHub integration availability is checked.
- If available, repository is connected to the ClickUp Space.
- Branches, commits or pull requests can reference ClickUp tasks.
- If unavailable, limitation is documented.

Priority: Low

Story Points: 2

Dependencies: ClickUp workspace access, GitHub repository access

Suggested Sprint: Documentation Sprint

Status: Planned

## Epic: Documentation

### Feature: Update Sprint Log After Each Sprint

User Story:

As a Scrum Master, I want the sprint log updated after each sprint so that the
project history remains transparent.

Acceptance Criteria:

- Sprint goal is recorded.
- Completed work is listed.
- Carry-over work is identified.
- Notes and risks are captured.

Priority: Medium

Story Points: 1

Dependencies: Sprint completion

Suggested Sprint: Every Sprint

Status: Backlog

### Feature: Update Changelog After Each Release

User Story:

As a stakeholder, I want the changelog updated after each release so that product
progress is clear.

Acceptance Criteria:

- Version follows semantic versioning.
- Added, Changed, Fixed and Removed sections are used where relevant.
- Release date is included.
- Completed features match repository state.

Priority: Medium

Story Points: 1

Dependencies: Release completion

Suggested Sprint: Every Release

Status: Backlog

### Feature: Document AI-Assisted Development Workflow

User Story:

As a portfolio reviewer, I want to understand how AI tools are used so that I
can evaluate the collaboration process responsibly.

Acceptance Criteria:

- AI role is documented.
- Human decision points are documented.
- Review and validation practices are described.
- Limitations and safeguards are included.

Priority: Medium

Story Points: 2

Dependencies: SCRUM_MASTER_PORTFOLIO_CASE.md

Suggested Sprint: Documentation Sprint

Status: Backlog

### Feature: Create Portfolio Case Study Outline

User Story:

As a portfolio reviewer, I want a clear case study outline so that I can quickly
understand the product, process and outcomes.

Acceptance Criteria:

- Covers project context, vision and agile approach.
- Includes sprint planning and backlog management.
- Includes engineering practices.
- Includes metrics and lessons learned.

Priority: High

Story Points: 3

Dependencies: Sprint Log, Product Backlog, Release Plan

Suggested Sprint: Documentation Sprint

Status: Ready

## Epic: Future Platform

### Feature: Authentication

User Story:

As a future contributor, I want an account so that my submissions and activity
can be associated with my profile.

Acceptance Criteria:

- Authentication requirements are documented.
- User roles are defined.
- Backend dependency is identified.
- Implementation is deferred until Community MVP requires it.

Priority: Low

Story Points: 8

Dependencies: Community workflow, backend decision

Suggested Sprint: Future

Status: Planned

### Feature: Community Forum

User Story:

As a community theorist, I want discussion spaces so that I can debate theories
and collaborate on investigations.

Acceptance Criteria:

- Forum requirements are documented.
- Moderation needs are identified.
- Topic and comment models are drafted.
- MVP implementation scope is separated from future enhancements.

Priority: Medium

Story Points: 13

Dependencies: Community moderation workflow, Authentication planning

Suggested Sprint: Future

Status: Planned

### Feature: Interactive Map

User Story:

As a mystery hunter, I want to browse discoveries by location so that I can
connect cases to places in Leonida.

Acceptance Criteria:

- Map discovery requirements are documented.
- Marker and location models are drafted.
- Mobile and performance risks are identified.
- Implementation is deferred until case/location data is stable.

Priority: Medium

Story Points: 13

Dependencies: Case model, location model, Cases MVP

Suggested Sprint: Future

Status: Planned

### Feature: Search and Filters

User Story:

As a visitor, I want to search and filter cases so that I can find relevant
mysteries quickly.

Acceptance Criteria:

- Search requirements are documented.
- Filter categories are defined.
- Status filtering aligns with StatusBadge.
- Implementation follows Cases MVP data model.

Priority: Medium

Story Points: 8

Dependencies: Cases archive, Case type, mock or backend data

Suggested Sprint: Future

Status: Planned

### Feature: Next.js Migration

User Story:

As a product owner, I want to migrate to Next.js after the Home MVP is complete
so that future case pages can benefit from routing, SEO and server rendering.

Acceptance Criteria:

- Home MVP is complete before migration starts.
- Styled Components SSR requirements are researched.
- Asset handling differences are documented.
- Migration plan preserves `src/components` and design system structure.

Priority: Low

Story Points: 13

Dependencies: Home MVP completion, stable routing requirements

Suggested Sprint: Future

Status: Planned
