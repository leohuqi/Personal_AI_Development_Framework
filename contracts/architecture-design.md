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
