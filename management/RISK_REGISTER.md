# Risk Register

| Risk | Impact | Probability | Mitigation | Owner | Status |
|---|---|---:|---|---|---|
| Generated legacy UI conflicts with official Styled Components architecture | High | Medium | Keep legacy folder untouched until a dedicated cleanup task inventories imports | Engineering | Open |
| README encoding issues reduce portfolio polish | Medium | High | Fix README encoding in technical debt sprint | Documentation | Open |
| Home components remain hardcoded too long | Medium | High | Define Case type and mock data in Sprint 4 | Product/Engineering | Open |
| Scope expands into community/auth/map before MVP is stable | High | Medium | Keep roadmap phased and require Definition of Ready | Product Owner | Open |
| Next.js migration happens too early | High | Low | Follow ADR: migrate only after Home MVP is complete | Architecture | Controlled |
| No automated tests exist yet | Medium | Medium | Add testing strategy after Home MVP components stabilize | Engineering | Open |
| Dependencies include unused generated-tooling packages | Medium | Medium | Audit dependencies after legacy cleanup plan | Engineering | Open |
| Accessibility is handled late | High | Medium | Add accessibility acceptance criteria to Home MVP tasks | Design/Engineering | Open |
| Visual identity becomes inconsistent as components grow | Medium | Medium | Use design system primitives and theme tokens | Design System | Controlled |
| Community submissions create moderation and content safety concerns | High | Medium | Specify moderation workflow before implementation | Product | Planned |
