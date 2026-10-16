# Design Consistency & Readiness Gate — PADF V0.3

Schema: `padf.design-gate/v1`. **Approved governance model C**: Master manages the Gate and task routing; Independent Reviewer checks design quality by risk; Owner remains the decision authority for major design and coding authorization. Designer produces Design Handoff through existing V0.2 contract.

## Mandatory decision inputs
- context_id + immutable original Feature ID, real Issue/Task Contract, source/architecture/API/UI Profile revisions.
- Task size S/M/L/XL + risk classification and rationale from Master.
- Master-selected architecture_scope (none/system/module/both) with routing rationale. MODULE consumes pinned Owner-approved system_baseline_ref; BOTH enforces SYSTEM -> MODULE and matching baseline.
- Required Solution Architect/Module Architect/UX stage deliverables with immutable paths/SHAs and completeness/diagram/prototype evidence, or justified N/A.
- Design consistency: Feature Spec ↔ Architecture ↔ API/Schema/Workflow ↔ UI Profile/UX + diagram/source accuracy.
- Fresh independent DESIGN review evidence and reviewed design artifact revisions **when required**.
- Approval/waiver records, unresolved issues, changed upstream refs, version freshness and blockers.
- Separate bounded Owner authorization to begin coding.

## Risk-triggered review
- **L/XL**: independent Design Review is **mandatory** even when the design looks low-risk.
- **S/M**: Master classifies. Must trigger independent Design Review when authentication/permissions/privacy, risky or destructive schema migration, breaking API, critical financial/business rules/workflow, shared component/design-system baseline, serious integration/security/concurrency or cross-module behavior is touched.
- Other S/M tasks can use Designer self-check + Master artifact completeness/version check. Master must **record rationale** for review skipped. No self-approval represented as independent review.

## Two architecture responsibilities
- Solution Architect: whole-app technical stack, system boundaries, high-level application code skeleton, deployment and matching diagrams; [Solution Architecture](solution-architecture.md).
- Module Architect: module code/package/interface design and code-level diagrams **within** an approved system baseline; [Module Design](module-design.md).
- Master selects by impact, not task size alone. Module-only features do not repeat system-level decisions. In BOTH, module starts only after system baseline approval and records its exact revision.
- A change to system architecture invalidates affected Module Design and downstream review until reevaluated.

## Separation of duties
- **Designing agent**: technical/UI evidence and own validation; may send Handoff, never independently approve own work.
- **Independent Reviewer (DESIGN mode)**: inspects original approved requirements and source designs at exact immutable revisions, runs independent checks, reports APPROVE / APPROVE WITH CONDITIONS / REQUEST CHANGES with P0–P3 findings. Reviewer does **not** authorize dispatch or mark Design Gate PASSED.
- **Master**: validates dependency graph, required artifacts, risk, independent-review decision, Owner approvals, stale status; records PASS/BLOCKED/NEEDS_REFINEMENT as gate result and routes remediation. Cannot waive a missing required independent review.
- **Owner**: approves material changes, accepts P2 risks with explicit conditions, separately authorizes coding. Owner acceptance is not a substitute for independent Design Review on L/XL.

## Gate outcome
- `DESIGN_READY`: dependencies/evidence fresh, review requirement satisfied, material decisions approved, no blocking findings; **not coding authorization**.
- `BLOCKED`: missing evidence/dependency, stale revision, P0/P1, missing mandatory review, unapproved major decision or unsafe contradiction.
- `NEEDS_REFINEMENT`: nonblocking gaps or P2 pending explicit resolution/acceptance, before final gate.
- `CODING_AUTHORIZED`: DESIGN_READY **plus** explicit bounded Owner coding approval and required Task Contract. Never automatically dispatch.
- P2 must be fixed/reviewed or individually Owner-accepted with linked conditions; P3 may be tracked.

## Handoff fields (extension, not new protocol)
Design Handoff adds `artifact_manifest_ref`, `spec_revision`, `architecture_revision`, `ui_profile_revision`, `prototype_level`, `diagram_dependency_version`, `self_checks`, `independent_review_ref` (if already reviewed), `stale_checks`, `next_role`, `decision_needed`. Every required field points to a persisted real artifact or is N/A with reason.


## V0.3 real orchestration acceptance is a separate gate input
For a Master-led *cross-session validation pilot*, require the complete [Agent Dispatch Chain](agent-dispatch.md) in addition to the existing design/dependency/Owner/Reviewer gates. Set `orchestration_validation_required: true` and supply `orchestration_chain`, `owner_live_evidence_review_ref` and actual role execution refs for every routed professional Skill. Missing chain, a ROLE_SIMULATION record or an unreviewed external runtime claim is BLOCKED; the read-only checker can validate **metadata only**.
**Do not equate** `ORCHESTRATION_CHAIN_COMPLETE` with professional design quality. The Owner independently grades each Skill using [Quality Evaluation](skill-delivery-evaluation.md); a real L/XL still requires Independent DESIGN Review and approved system/UI baselines before DESIGN_READY. A missing approved baseline permits a **conditional module draft** but never formal module completion.
