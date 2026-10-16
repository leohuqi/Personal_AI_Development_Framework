# Routing Skills by task size

| Work type | Route |
| --- | --- |
| S — isolated bug | Authorized Coder → focused tests → risk-based Review |
| M — feature | Master/approved Feature Spec → Coder → QA & CI → Independent Reviewer → Owner |
| L — cross-module | Architecture impact & feature splitting → bounded delivery → integration review |
| XL — new product / major change | Discovery / UX / architecture approval → Roadmap → incremental MVP Cycles |

Default to a single Coder; parallel work requires clear non-overlapping boundaries, separate worktrees and explicit authorization. V0.3 adds separate Solution Architect, Module Architect and UI Designer, invoked only where scope/risk justifies the work; no new Product Analyst or scheduler.

## V0.2 context routing (all task sizes)
- Master is accountable for resolving context_id, issue + immutable Feature ID, approved source revisions, owner authorization, and actionable unresolved messages **before** task dispatch.
- The context-coordinator Skill is invoked **as a procedure** by the active role as needed: resolve_context, read_messages, record_message, create_checkpoint, prepare_handoff, resume_context and reconcile_context. It does not independently dispatch agents.
- S bugs: minimal task context/checkpoint at handoff; avoid heavyweight choreography.
- M/L/XL: typed handoffs at architect/design/coding/QA/review boundaries as applicable; link exact artifacts and source SHA. Parallel roles may converse directly, but durable decisions and approval-affecting changes must be traceable.
- Clarifications go to relevant role, unresolved blockers/conflicts to Master, significant product/UX/architecture scope changes to Owner. Message routing does not change approval policy.
- Fresh-context Independent Reviewer gets approved source contracts, exact diff and evidence—not the Coder's whole conversation.
- Follow [CACF workflow](context-communication.md) and [Agent Message](../contracts/agent-message.md) rules.

## V0.3 capability-based routing
Master analyzes actual Feature Spec and sets `task_class`, `impacts`, `risk_flags` with rationale. Use [sequential design workflow](design-collaboration.md) and [declarative evaluator](../lib/design-gate.mjs) as optional read-only checks, not an execution engine.
- Master explicitly decides `architecture_scope: none | system | module | both` using real affected boundaries and current approved architecture, **not only S/M/L/XL**; document rationale in Task Contract.
- **solution-architect**: new APP, whole-system technology stack/framework selection, platform/storage/runtime replacement, system-wide service boundaries/deployment or major cross-module architecture decision. Output pinned [Solution Architecture Baseline](../contracts/solution-architecture.md), stack choices, high-level application code/module topology and professional diagrams.
- **module-architect**: module-local API/schema/workflow/data design, code packages/classes/interfaces/tests **inside an approved pinned system baseline**. Output [Module Code Design](../contracts/module-design.md), module structure/interface contract and diagrams. No independent technology stack replacement.
- **both** only when selected system baseline is being established/changed **and** detailed module design is genuinely needed: enforce SYSTEM -> MODULE and new approved baseline ref before module proceeds. Never automatically invoke both because a Feature is L/XL.
- **none** for simple bug/UI-only changes with reason; pass affected existing baseline to Coder by reference when useful.
- UI/navigation/shared components/interaction: **ui-ux-designer**; use per-project approved design profile, choose concept/high-fi/interactive level by complexity.
- Mixed system/module/UI feature: sequence based on dependency; early UX exploration can precede API feasibility discussion or vice versa. Don't require both for UI-only or backend-only work.
- L/XL: mandatory independent DESIGN Review. S/M: review mandatory when high-risk; otherwise Master records skip rationale. Owner approves significant design changes regardless of size.
- Master owns dependency assessment, Gate, blockers and next role; Reviewer independently assesses the design at exact source revisions. Do not conflate `DESIGN_READY` with authorized coding.
- Producer handoff uses [existing V0.2 contract](../contracts/agent-handoff.md); Context Coordinator persists messages/checkpoints as before.
