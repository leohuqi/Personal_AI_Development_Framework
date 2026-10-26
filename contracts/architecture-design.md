# Architecture Design Package — PADF V0.3

Schema: `padf.architecture-design/v1`. Umbrella **versioned design manifest**; ownership and required artifacts depend on architecture scope chosen by Master. It does **not** replace [Solution Architecture](solution-architecture.md) or [Module Code Design](module-design.md).

## Routing scope
| `architecture_scope` | Role | Required artifact types | Intent |
| --- | --- | --- | --- |
| `system` | `solution-architect` | `solution-architecture`, `technology-stack`, `application-code-structure`, `architecture-diagram` | Create/change the APP-wide platform/technical baseline |
| `module` | `module-architect` | `module-design`, `module-code-structure`, `module-interface-contract`, `module-component-diagram` plus pinned `system_baseline_ref` | Detail one module within the approved system baseline |
| `both` | system then module | Both package sets with explicit SYSTEM -> MODULE dependency and SHA alignment | A new app/major system change with selected module implementation design |
| `none` | no Architect | N/A reason for no architecture work | Simple bug/UI-only changes where existing contracts suffice |

## Common identity and acceptance
- `context_id`, Linear Issue, immutable original Feature ID(s), approved Feature Spec@SHA, Master selected scope/rationale, task size/risk and revision.
- Owner approval refs, current-versus-target, affected interfaces/modules, security/performance/reliability, constraints, tradeoffs, rollout/rollback, tests, open design decisions.
- **System** package records technology/framework selection, approved system architecture revisions and top-level code/module structure, not each module's file/method-level implementation.
- **Module** package records exact approved `system_baseline_ref`, affected directory/package structure, classes/interfaces/contracts, dependency directions, key flows/data transactions and test seams, not a new technology stack.
- Each actually relevant data/API/workflow/deployment impact adds authoritative source (SQL DDL, OpenAPI, state rules, deployment manifest) **and** a checked diagram if material. Unaffected categories may reference unchanged models with N/A justification, avoiding gratuitous graphics.
- Manifest: `artifact_id | type | path/permalink@SHA | source@SHA | generator + pinned Skill SHA (if visual) | render/consistency check | open issues`.
- Diagram HTML/SVG is visualization, never authoritative DDL/API/program behavior; matching technical source defines behavior. Missing real renderer/Skill = BLOCKED/NOT RUN, not fabricated PASS.

## Responsibility and approval
Designers produce and self-check versioned packages and existing V0.2 Handoff; recipients ACK. Independent Reviewer checks DESIGN quality when L/XL or high-risk S/M. Master checks exact dependencies, `system_baseline_ref`, Review status and Design Gate. Material changes require Owner approval; DESIGN_READY is **not** coding authorization.

## Architecture Profiles and layered navigation (method only)

Use the shared [architecture method](../standards/architecture/README.md) for risk-based Lite/Standard/Full tailoring, L0–L3 navigation, single authority, and minimal role reading. The profile is a separate advisory choice, **not** a new value or replacement for `architecture_scope`, schema, artifact requirements, approval, or readiness. Preserve all existing machine fields and required types above. Scope module still requires its checked component diagram even when the method suggests Lite; scope system/both preserves its required diagrams. Only scope none or valid reuse permitted by the existing Gate can omit a new drawing. Material risks add necessary explanation and review recommendations; no existing independent DESIGN Review or Owner decision is removed. Requests to relax the old Gate remain separate pending decisions, not implemented exceptions.

A project's Architecture README routes readers to L0 Overview, affected L1 system views, L2 module contract, and L3 Feature/API/schema details. These document layers are not the C4 diagram levels. Complex migration may use fact-level MIGRATED / NORMATIVE_REUSE / HISTORICAL_ONLY; optional source status never changes approval. Stable model IDs and ordered/guarded relations define semantics; Diagram-Design only presents them. Cite exact sources and report actual rendering, visual inspection and semantic checks separately.
