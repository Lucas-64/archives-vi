# Recommended ClickUp Structure

## Space

Space name: Archives VI

Purpose: manage product delivery, design system work, documentation, technical
debt and portfolio-facing Scrum artifacts for the Archives VI project.

## Folders

- Product Delivery
- Product Discovery
- Design System
- Engineering
- Documentation
- Project Management
- Future Versions

## Lists

Product Delivery:

- Epics
- Features
- User Stories
- Technical Tasks

Product Discovery:

- Research
- Specifications
- UX Requirements

Design System:

- UI Primitives
- Component Documentation
- Design Debt

Engineering:

- Technical Debt
- Architecture
- Build and Validation

Documentation:

- Project Docs
- Portfolio Docs
- Changelog

Project Management:

- Sprint Planning
- Backlog Refinement
- Risk Register

Future Versions:

- Authentication
- Community
- Interactive Map
- Next.js Migration

## Statuses

Recommended workflow:

- Backlog
- Ready
- In Progress
- Code Review
- Testing
- Done

Parallel status:

- Blocked

Usage:

- `Done`: completed work present in the repository.
- `Ready`: next actionable work with enough context to start.
- `Backlog`: planned work that still needs refinement or sequencing.
- `Code Review`: work waiting for technical or documentation review.
- `Testing`: work waiting for local validation, build check or acceptance
  validation.
- `Blocked`: work waiting on a decision, dependency or technical unlock.

## Custom Fields

- Epic
- Sprint
- Release
- Story Points
- Estimated Hours
- Task Type
- Parent Task
- Dependencies
- Component
- Area
- Risk
- Owner
- Acceptance Criteria
- Definition of Done

## Tags

- `react`
- `vite`
- `typescript`
- `styled-components`
- `design-system`
- `home`
- `cases`
- `community`
- `auth`
- `map`
- `documentation`
- `technical-debt`
- `portfolio`
- `scrum`

## Views

- Board by Status
- List by Sprint
- Table by Epic
- Calendar by Release
- Workload by Estimated Hours
- Backlog by Priority
- Risk Register
- Documentation Tracker
- Sprint Board: track active sprint work by status.
- Release Roadmap: visualize work grouped by release.
- SM Portfolio View: highlight planning, sprint, risk, documentation and agile
  management artifacts for portfolio presentation.

## Automation Suggestions

- When status changes to `Done`, require Definition of Done to be filled.
- When status changes to `Testing`, require Acceptance Criteria to be checked.
- When priority is `High`, add tag `high-priority`.
- When Task Type is `Documentation Task`, move to Documentation folder.
- When Sprint field is set, add task to Sprint Planning view.
- When Release is set, add task to Release Roadmap view.
- When Owner is `Codex`, add tag `ai-assisted`.
- When Owner is `ChatGPT Review`, add tag `review-needed`.
- When status changes to `Blocked`, require Risk or Dependency field.
- When Epic is `Technical Debt`, add tag `technical-debt`.
- When Task Type is `Research Task`, assign to Product Discovery list.
