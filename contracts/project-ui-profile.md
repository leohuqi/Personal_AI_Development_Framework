# Project UI Design Profile — PADF V0.3

Schema: `padf.ui-profile/v1`. **Each consuming application** maintains its own versioned UI baseline (example: `docs/design/ui-profile.md` plus token/component references). PADF supplies this contract, **not shared mandated colors**.

## Required contents
- `project_id`, profile path/approved revision/Owner approval, status APPROVED|PROPOSED, responsible UI Designer; exact source references.
- **Design philosophy:** primary user roles, workflows, usability goals, visual tone, target information density and evidence/assumptions.
- **Visual tokens:** color role semantics (success, warning, destructive, price movement when relevant), typography, spacing scale, radius/border, elevation, icons, chart tokens and light/dark behavior.
- **Component catalog:** canonical component path/version, variants, keyboard behavior, defaults, validation/empty/loading/error/permission states and usage/exception rules.
- **Layout/navigation:** responsive breakpoints, grid, nav and detail-page patterns, table/chart density, modal/drawer behavior.
- **Interaction conventions:** feedback/confirmation, selection, optimistic state, error recovery, accessibility WCAG targets, localization and motion.
- **Exceptions:** affected screen, requested deviation, reason, impact, Owner approval ref; deviations remain local unless profile revision is approved.
- Reference existing source design system/Figma/source code where available. No invented Figma URLs, tokens or screenshots.

## Bootstrapping a legacy project
1. Examine implemented UI, screenshots, component library and current UX spec. **Observed** values are not automatically approved.
2. Propose missing token/interaction definitions with `PROPOSED` status; record conflicts and provide representative screens.
3. Obtain Owner authorization for a new project-wide baseline or major change. Until then, minimize deviation from observed UI and mark profile dependency unresolved as needed.
4. Every UI Feature Package pins profile revision; mismatched profile or changed components make the dependent design STALE until revalidated.

## Sample schema fragment (illustrative, no actual PQA approval)
```yaml
schema_version: padf.ui-profile/v1
project_id: EXAMPLE
status: PROPOSED
profile_ref: docs/design/ui-profile.md@<commit>
design_philosophy:
  information_density: high
tokens_ref: src/styles/tokens.css@<commit>
component_catalog_ref: src/components/README.md@<commit>
breakpoints: ["<project-defined>"]
exceptions: []
owner_approval_ref: null
```
