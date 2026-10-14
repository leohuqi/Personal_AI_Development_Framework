# Architecture Design Package — PADF V0.3

Schema: `padf.architecture-design/v1`. A **versioned technical design artifact and manifest** for one approved feature, not a new source of requirements.

## Header (required)
- `context_id`, Linear Issue, immutable original Feature ID(s), author/role, source Feature Spec path and approved commit, base architecture/ADR revision, date/status PROPOSED|COMPLETED|APPROVED.
- Owner approval refs, scope, out-of-scope, inputs, assumptions, dependencies, unresolved decisions, downstream affected roles.
- Design choices, alternatives and tradeoffs, current vs target architecture, contracts, security/permissions, data lineage, NFRs, failure/retry, rollout/rollback and validation plan.

## Impact -> deliverable matrix
| Impact | Required authoritative model/spec | Visual evidence using diagram-design when material |
| --- | --- | --- |
| System/module topology | Architecture section, interface boundaries | Architecture or delta diagram |
| Database/schema | Entities, SQL DDL/migration plan, types/FKs/indexes | DB schema / ER diagram |
| API/integration | OpenAPI or exact request/error contract | Sequence/integration/data-flow diagram if multi-component |
| Business workflow | Steps, guards, failure/compensation semantics | Flowchart/swimlane when nontrivial |
| State transitions | State/event/transition/guard table | State machine |
| Deployment | Zone/network/identity/runtime manifest | Deployment/trust-boundary diagram |

Record **required/optional/N/A + justification** per category: avoid gratuitous diagrams on unaffected areas. Existing unchanged diagrams may be referenced with valid source revision; don't re-render without reason.

## Manifest table (per artifact)
`artifact_id | kind | path/permalink | SHA/revision | linked source specification@SHA | generator+locked SHA (if diagram) | render/consistency check | issues`

- Each diagram must faithfully match the authoritative model: SQL types/FKs/cardinality, API method/error semantics, edge directions, state transitions and trust boundaries. HTML/SVG alone never establishes Schema correctness.
- If no environment to generate required visual, mark BLOCKED and hand back to Master. No false PASS for unchecked browser rendering.
- Material architectural decisions/changes require Owner approval and ADR/source update. Completion by Architect is **not independent Design Review**.
- [Agent Handoff](agent-handoff.md) points to this package and artifact manifest. [Design Gate](design-gate.md) checks it.
