# Specialized Design Agent Collaboration — PADF V0.3

**Role-based sequential workflow, not parallel execution orchestration.** This document extends [WORKFLOW.md](WORKFLOW.md) and [CACF V0.2](context-communication.md); existing Task Contract, Agent Message, Checkpoint and Handoff remain in force.

## Stage selection
Master reads approved feature scope, task class, risk flags and affected modules and runs a capability classification (documented in [agent-routing.md](agent-routing.md)). 
- S: code-only bug normally goes Coder -> tests -> risk-based review; no invented architecture/UI package.
- M: invoke Architect if API/schema/integration/workflow changes; UI Designer if UI/interaction changes; both when their artifacts actually matter.
- L/XL: invoke relevant designers **and mandatory independent DESIGN review**, even if only one design domain is affected.
- High-risk S/M: mandatory independent DESIGN review (auth/permissions/privacy, destructive schema, breaking API, critical rules/workflows, shared design-system/component, complex integration etc.).
- No need to launch Architect/UI simultaneously: order by dependency. Early UX concept may precede Architect when it drives API requirements; Architect may first constrain feasible UI.

## Phases and owners
| Phase | Producer / owner | Evidence / criteria |
| --- | --- | --- |
| Feature/classification | Master | Approved spec, class S/M/L/XL, risks and routing reason |
| Architecture | Solution Architect | [Architecture Package](../contracts/architecture-design.md): structured contract + justified diagrams |
| UI/UX | UI Designer | [UI Package](../contracts/ui-design.md), project [UI Profile](../contracts/project-ui-profile.md) + concept/high-fi/interactive level |
| Design Handoff | Producing Architect/Designer | V0.2 [Agent Handoff](../contracts/agent-handoff.md), manifest, exact refs; receiving agent ACK / NEEDS_REFINEMENT |
| Dependencies | Master | [Stage Dependency](../contracts/agent-dependency.md) checks completeness and stale revisions, unresolved blockers |
| Independent Design Review | Independent Reviewer (DESIGN mode) | Required L/XL and high-risk S/M; exact artifacts; P0-P3 independent findings |
| Design Consistency Gate | Master | [Gate](../contracts/design-gate.md) decides DESIGN_READY or BLOCKED using evidence, not self-review |
| Coding authorization | Owner | Separate bounded approval + Task Contract; DESIGN_READY alone does not start coding |
| Implementation | Coder -> QA -> Implementation Reviewer | Existing PADF V0.2 controls remain; exact PR head evidence |

## Architectural and UI agreement
- Each UI data interaction must cite approved API schema/version and error cases; Architect responds through durable CLARIFICATION_REQUEST/RESPONSE for ambiguities. 
- Revisions to approved business/architecture/UX baselines require Owner approval, then update canonical GitHub spec/ADR/profile and invalidate dependent stale artifacts.
- Master checks for unresolved contradictions; Reviewer checks consistency independently where required, not through Design Agent self-certification.
- No owner-approved deviation? Follow existing project tokens/components and architecture; do not use a generic visual style on every new screen.

## Gate outcomes
- DESIGNED / COMPLETED by producer: **not automatically APPROVED**.
- For mandatory independent review, lack of exact revision-matched independent review -> BLOCKED, even if Owner endorses UX.
- Gate DESIGN_READY is readiness only. Coder needs separately recorded owner authorization; no automatic dispatch or new runtime.
- A revised architecture/schema/UI profile means related stage and gate need revalidation; avoid unnecessary redoing unaffected artifacts. No last-write-wins or silent waiver.

## Example (illustrative)
An M-level UI-only edit with no shared-component or other mandatory review risk: UI Designer may produce L2 source pinned to project UI profile, Master checks consistent tokens/behavior, records review skip reason, obtains separate Owner coding authorization. An L-level strategy/stock-detail change with API/UI effects: Architect produces contract+diagram, UI Designer produces high-fi or interactive prototype, Independent Reviewer checks exact design revisions, Master marks Design Gate, Owner authorizes Coder. PQA-specific tasks are not authorized by this example.

## Validation
The pure [design-gate evaluator](../lib/design-gate.mjs) supports offline checks for invalid dependency graphs, revisions, risk routing, missing evidence and Owner coding approval. Actual diagrams/prototypes must be created by installed tools, manually viewed/used, and independently reviewed in an authorized task. A PASS in the fixture does not prove those external tools have run.
