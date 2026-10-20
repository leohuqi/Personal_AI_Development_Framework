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

## 必需 UI 阶段的存在性

当路由结果为 `ui_required: true` 时，阶段清单必须包含 `agent: ui-ux-designer` 且 `required` 不为 `false` 的阶段。缺失阶段、只有可选/N/A 的 UI 阶段，或以其他角色提交 UI 产物，都返回 `BLOCKED`，原因包含 `MISSING_UI_DESIGN_STAGE`，并强制 `coding_authorized: false`。已有 Owner 编码授权不能绕过设计门禁。

阶段存在后，仍须继续验证其依赖、完成状态、UI Profile 版本、设计规格、视觉产物，以及 L3 所需的可运行交互原型；不能仅凭角色名称认定通过。未路由 UI 的任务不新增 UI 阶段要求。

## Risk-triggered review
- 判定同时读取 `impacts` 与 `risk_flags`：任一字段出现已知强制风险类别，都不能通过另一个字段为空或填写 review-skip 理由取消独立审查。适用类别为 `auth`、`permissions`、`privacy`、`security`、`destructive-migration`、`risky-schema-migration`、`breaking-api`、`critical-business-rule`、`critical-workflow`、`design-system`、`shared-component`、`integration`、`concurrency`、`cross-module`、`financial-data`。
- **L/XL**: independent Design Review is **mandatory** even when the design looks low-risk.
- **S/M**: Master classifies. Must trigger independent Design Review when authentication/permissions/privacy, risky or destructive schema migration, breaking API, critical financial/business rules/workflow, shared component/design-system baseline, serious integration/security/concurrency or cross-module behavior is touched.
- Other S/M tasks can use Designer self-check + Master artifact completeness/version check. Master must **record rationale** for review skipped. No self-approval represented as independent review.

## Two architecture responsibilities
- 路由只能扩大实际影响要求的职责范围：已知系统影响要求 `system` 或 `both`，已知模块影响要求 `module` 或 `both`。同时存在两类影响时必须选择 `both`。`system` 不是 `module` 的替代，单独的理由或 N/A 声明不能排除已知必需角色。
- Solution Architect: whole-app technical stack, system boundaries, high-level application code skeleton, deployment and matching diagrams; [Solution Architecture](solution-architecture.md).
- Module Architect: module code/package/interface design and code-level diagrams **within** an approved system baseline; [Module Design](module-design.md).
- Master selects by impact, not task size alone. Module-only features do not repeat system-level decisions. In BOTH, module starts only after system baseline approval and records its exact revision.
- A change to system architecture invalidates affected Module Design and downstream review until reevaluated.

## Separation of duties
- **Designing agent**: technical/UI evidence and own validation; may send Handoff, never independently approve own work.
- **Independent Reviewer (DESIGN mode)**: inspects original approved requirements and source designs at exact immutable revisions, runs independent checks, reports APPROVE / APPROVE WITH CONDITIONS / REQUEST CHANGES with P0–P3 findings. Reviewer does **not** authorize dispatch or mark Design Gate PASSED.
- **Master**: validates dependency graph, required artifacts, risk, independent-review decision, Owner approvals, stale status; records PASS/BLOCKED/NEEDS_REFINEMENT as gate result and routes remediation. Cannot waive a missing required independent review.
- **Owner**: approves material changes, accepts P2 risks with explicit conditions, separately authorizes coding. Owner acceptance is not a substitute for independent Design Review on L/XL.

## UI Profile 批准与版本绑定（V0.3.1）

路由要求 UI 时，输入必须同时提供 `ui_profile_ref`、`ui_profile_status: APPROVED`、`ui_profile_approval_ref` 和 `ui_profile_approved_ref`。其中 `ui_profile_approved_ref` 必须与固定版本的 `ui_profile_ref` 完全相同，UI 阶段的 `profile_ref` 也须匹配；批准其他 SHA 不能批准当前版本。

- 状态缺失、PROPOSED、DEFERRED 或缺少批准证据引用：`PROJECT_UI_PROFILE_NOT_APPROVED`。
- 被批准版本缺失或不匹配：`UI_PROFILE_APPROVAL_VERSION_MISMATCH`。
- 上述问题均返回 BLOCKED 且 `coding_authorized: false`；不能用已有编码授权、绿色 CI、原型或独立审查结论替代 Profile 批准。
- 旧输入不补齐这些字段会被阻断，这是修正宽松校验后的预期行为；仅固定 SHA 不再充分。未路由 UI 的任务不增加此依赖。
- 允许继续编写 PROPOSED 设计草稿。正式门禁只接受已批准的项目基线，或 Owner 为当前任务明确批准的替代基线；替代基线使用相同字段和精确版本约束，不提供绕过开关。

评估器仅检查这些元数据的一致性，不访问远程审批或认证批准人。Master/Reviewer 必须从真实来源核验批准人的权限、批准范围和绑定版本；不能仅凭输入中的 APPROVED 或一个链接认定授权真实。

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
