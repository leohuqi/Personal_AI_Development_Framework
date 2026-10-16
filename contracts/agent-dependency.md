# Agent Stage & Artifact Dependency — PADF V0.3

Schema: `padf.agent-dependency/v1`. Lightweight **declarative** stage dependency and evaluation, not a scheduler or task daemon. Existing Linear `blocks` relation remains authoritative for **Feature-to-Feature** dependencies; this contract tracks **roles/stages and their deliverables inside a Feature**.

## Required per-task structure
`context_id`, original Feature ID, Linear Issue, task class S/M/L/XL, risk flags, approved Feature Spec ref, **Master-selected `architecture_scope: none|system|module|both` with rationale**, `stages[]`. For MODULE/BOTH also record approved `system_baseline_ref`, `system_baseline_status: APPROVED` and Owner approval evidence.
Each stage has unique `id`, `agent`, `required` (bool), `depends_on[]` (existing stage IDs), `status` (PENDING/READY/IN_PROGRESS/COMPLETED/BLOCKED/STALE/WAIVED), `artifacts[]` (type, immutable ref/SHA, required, verified, evidence_ref and check status; diagram generator SHA + PASS render result; interactive prototypes PASS interaction check and editable source), and `waiver` with recorded accountable Owner approval + reason when applicable.

## Dependency evaluation semantics
1. No duplicate stage IDs; every `depends_on` points to a distinct existing ID; no self-loop/cycle. Reject invalid data, do not skip missing links.
2. Stage COMPLETED means its own work and required artifacts have evidence; it **does not mean approved**.
3. Dependencies satisfy a stage only when parent is COMPLETED with required artifacts present/verified and (if gated) valid approval, OR WAIVED with an actual appropriate Owner waiver, not by status label alone.
4. BLOCKED/STALE stages and missing required artifact immutable refs block downstream stages. Stale is **revision-specific**; change of Feature Spec/UI Profile/API/Architecture or upstream artifact SHA invalidates relevant dependent gates; re-check affected descendants only.
5. System artifact types: `solution-architecture`, `technology-stack`, `application-code-structure`, `architecture-diagram`; Module artifact types: `module-design`, `module-code-structure`, `module-interface-contract`, `module-component-diagram`. BOTH requires SYSTEM -> MODULE dependency and approved matching baseline SHA. Module-only tasks reuse existing approved architecture.
6. Use **Design Gate** separate from delivery state: for S/M risk-triggered or L/XL, missing fresh independent design review blocks. For all tasks requiring development, missing bounded Owner coding authorization blocks.
7. Not applicable roles must be recorded as `required: false` and `N/A reason`; avoid fake COMPLETED and unnecessary review work.
8. Root stages can become READY when prerequisites and authorized design scope exist, but `READY` is not an auto-execution request.
9. Stable IDs, audit links and state-change reasons; no implicit cross-feature workflow/PR merges.

## System versus module dependency
- Task size determines risk-based Design Review, **not** whether both architects must run. Master records `architecture_scope` and justification.
- [Solution Architect](../.agents/skills/solution-architect/SKILL.md) owns [Solution Architecture Baseline](solution-architecture.md), APP-wide technology stack and high-level code/module topology.
- [Module Architect](../.agents/skills/module-architect/SKILL.md) owns [Module Code Design](module-design.md) pinned to a currently Owner-approved solution baseline. Missing/stale baseline BLOCKS module handoff.
- In BOTH, the MODULE stage must depend on SYSTEM and point to its newly approved `solution-architecture` artifact.
- Runtime metadata is declarative; Master must verify actual immutable refs/Owner approval from GitHub.

## Visual evidence and external skill pin
- Required artifact `verified: true` **without** a real `evidence_ref` is not sufficient.
- Required technical `*-diagram` artifacts must record `generator: diagram-design`, `generator_sha` matching the `diagram_skill_sha` supplied from the pinned [external lock](../integrations/diagram-design.lock.json), and `render_status: PASS`.
- An L3 `interactive-prototype` must record `interaction_test_status: PASS` and `editable_source: true`.
- The evaluator validates metadata consistency only; it **does not** install diagram-design, verify remote evidence links or run browser tests. These remain independent actual-agent acceptance requirements.

## Runnable evaluator
`lib/design-gate.mjs` exports `evaluateStageDependencies` and `evaluateDesignGate`. It is **pure read-only validation**, not dispatch, auto approvals or writes to Linear/GitHub. See `tests/v0.3/run-tests.mjs`.

## Minimal illustrative example (replace placeholder refs with real evidence)
```json
{
  "schema_version":"padf.agent-dependency/v1",
  "context_id":"EXAMPLE-001","feature_id":"EXAMPLE-F01",
  "task_class":"L","risk_flags":["cross-module"],
  "stages":[
    {"id":"ARCH","agent":"solution-architect","required":true,"depends_on":[],"status":"COMPLETED","artifacts":[{"type":"architecture-design","ref":"docs/arch.md@<sha>","verified":true}]},
    {"id":"UX","agent":"ui-ux-designer","required":true,"depends_on":["ARCH"],"status":"COMPLETED","artifacts":[{"type":"ui-design","ref":"docs/ui.md@<sha>","verified":true}]}
  ]
}
```
```<sha>``` denotes placeholder; it cannot satisfy strict validation.
