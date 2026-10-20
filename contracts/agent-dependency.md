# Agent Stage & Artifact Dependency — PADF V0.3

Schema: `padf.agent-dependency/v1`. Lightweight **declarative** stage dependency and evaluation, not a scheduler or task daemon. Existing Linear `blocks` relation remains authoritative for **Feature-to-Feature** dependencies; this contract tracks **roles/stages and their deliverables inside a Feature**.

## Required per-task structure
`context_id`, original Feature ID, Linear Issue, task class S/M/L/XL, risk flags, approved Feature Spec ref, **Master-selected `architecture_scope: none|system|module|both` with rationale**, `stages[]`. For MODULE/BOTH also record approved `system_baseline_ref`, `system_baseline_status: APPROVED` and Owner approval evidence.
Each stage has unique `id`, `agent`, `required` (bool), `depends_on[]` (existing stage IDs), `status` (PENDING/READY/IN_PROGRESS/COMPLETED/BLOCKED/STALE/WAIVED), `artifacts[]` (type, immutable ref/SHA, required, verified, evidence_ref and check status; diagram generator SHA + PASS render result; interactive prototypes PASS interaction check and editable source), and `waiver` with recorded accountable Owner approval + reason when applicable.

## UI 批准输入与路由约束（V0.3.1）

已知系统影响只能选择 `system/both`，已知模块影响只能选择 `module/both`，两者同时存在须选 `both`；不能用人工选择较窄 scope 或 N/A 排除必需角色。强制 DESIGN 审查同时根据 `impacts` 与 `risk_flags` 判定，已知高风险影响不能通过漏填风险标签绕过。

路由要求 UI 时，在任务根层增加 `ui_profile_status: APPROVED`、`ui_profile_approval_ref` 及 `ui_profile_approved_ref`，后者与固定版本的 `ui_profile_ref` 完全相同；阶段的 `profile_ref` 也须匹配。参见 [UI Profile 批准契约](project-ui-profile.md)及 [Design Gate](design-gate.md)。缺失或未批准的历史输入现在会被 BLOCKED；元数据通过不替代对实际 Owner 决定的核验。

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

## Minimal illustrative stages (illustration only)

### Existing approved APP — Module Architect only
```yaml
schema_version: padf.agent-dependency/v1
context_id: EXPENSE-EXAMPLE
feature_id: EXP-REC-001
task_class: M
architecture_scope: module
routing_rationale: Existing approved APP; only expense-import module changes
system_baseline_ref: docs/architecture/system.md@<approved-commit>
system_baseline_status: APPROVED
system_baseline_approval_ref: <real-owner-decision-link>
stages:
  - id: MODULE
    agent: module-architect
    depends_on: []
    required: true
    status: COMPLETED
    system_baseline_ref: docs/architecture/system.md@<approved-commit>
    artifacts:
      - {type: module-design, ref: "docs/module-expenses.md@<sha>", verified: true, evidence_ref: "<actual-artifact-evidence>"}
      - {type: module-code-structure, ref: "docs/code-expenses.md@<sha>", verified: true, evidence_ref: "<actual-artifact-evidence>"}
      - {type: module-interface-contract, ref: "docs/expense-api.yaml@<sha>", verified: true, evidence_ref: "<actual-artifact-evidence>"}
      - {type: module-component-diagram, ref: "docs/expense-components.html@<sha>", verified: true, evidence_ref: "<actual-render-evidence>", generator: diagram-design, generator_sha: "<locked-sha>", render_status: PASS}
```

### New APP + first module — ordered SYSTEM -> MODULE
Set `architecture_scope: both`. Add a SYSTEM stage with Solution Architect artifacts `solution-architecture`, `technology-stack`, `application-code-structure`, `architecture-diagram`. After applicable Owner approval, MODULE has `depends_on: [SYSTEM]` and its `system_baseline_ref` exactly matches SYSTEM's `solution-architecture` ref. Do not produce these concurrently or claim that Owner approval is automatic.

Placeholder values `<sha>` and `<approved-commit>` above are **not** valid immutable SHAs or authorizations. Real Gate evidence requires pinned versions and verified artifact/render links.


## V0.3 proven execution vs declarative dependencies
A stage marked `COMPLETED` on paper is not proof that a separate Agent actually executed it. For the **real Master-orchestration acceptance pilot**, attach the matching [Dispatch → Execution → Handoff → Reconciliation](agent-dispatch.md) record and verify the dependency's **earlier reconciliation ref** before the next dispatch. The [orchestration-evidence checker](../lib/orchestration-evidence.mjs) rejects a missing predecessor/dispatch, reverse chronology, mismatched execution IDs and in-session role simulation. These metadata checks do not authenticate external ChatGPT/Work sessions or approve the Owner's baseline.
