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

## 产品定义先于正式设计（下一版增量）

`product_scope: define/refine` 或本次尚需定义/修订的 `product-definition/product-behavior` 影响时路由 PA。新应用默认补产品定义，但已有本阶段完整有效获批规格时可明确 `product_scope: reuse`，仍需 SA；“应用尚未实现”不等于“产品规格尚未定义”。reuse 不能用于掩盖实际产品缺口/变更。需有必需 COMPLETED 且产物验证通过的 PA 阶段（WAIVED 不能替代完成/内容），提供 `product-definition`、`feature-specification`，后者匹配新两阶段任务的 `product_spec_ref`（旧任务仍匹配 `feature_spec_ref`）；只有 Catalog 不足。必需 SA/Module/UI 阶段直接或传递依赖产品阶段，不能先正式完成后补产品。早期研究/条件提案不因此禁止，但不能使最终门禁通过。

没有该增量输入的 v0.3.2 来源默认复用规格路径，以保留现有契约/测试兼容；这不把空白规格或未知产品方向解释为已批准。Master 仍实际阅读[产品定义](product-definition.md)和[角色成果标准](role-deliverables.md)，检查内容而非只信 artifact 类型。机器 PASS 不代表产品有用、系统完整或 UX 可用；独立审查与 Owner 权限不变。

## 必需 UI 阶段的存在性

当路由结果为 `ui_required: true` 时，阶段清单必须包含 `agent: ui-ux-designer` 且 `required` 不为 `false` 的阶段。缺失阶段、只有可选/N/A 的 UI 阶段，或以其他角色提交 UI 产物，都返回 `BLOCKED`，原因包含 `MISSING_UI_DESIGN_STAGE`，并强制 `coding_authorized: false`。已有 Owner 编码授权不能绕过设计门禁。

阶段存在后，仍须继续验证其依赖、完成状态、UI Profile 版本、设计规格、视觉产物，以及 L3 所需的可运行交互原型；不能仅凭角色名称认定通过。有多个必需 UI 阶段时逐个验证这些条件，不能只检查首个阶段；可选/N/A 阶段不替代必需阶段。未路由 UI 的任务不新增 UI 阶段要求。

## Risk-triggered review
- 风险分类只决定独立审查是否必须开展。只要提供了 `design_review`，就必须校验其 DESIGN 模式、独立性、证据、精确产物覆盖和发现结构；`REQUEST_CHANGES`、未修复 P0/P1、未获明确条件接受的 P2 在所有 S/M/L/XL 上阻断。低风险跳过理由不能覆盖已有拒绝或发现；未提供审查时才适用有理由的低风险跳过。修复后的发现、合法的 P2 接受与已知 P3 按原政策处理。
- 已提供审查的 `findings` 必须为数组；无发现显式写 `[]`。每项须有 P0/P1/P2/P3 严重度和非空状态，畸形或未声明的发现清单不能解释为“没有发现”。
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
- **Master**: checks substantive coverage, implementability and cross-role consistency as well as dependencies, risk, independent-review evidence and Owner approvals; returns concrete content gaps for refinement and integrates recommendations. It cannot waive mandatory independent review or approve material decisions.
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

## 两阶段规格与 staged UI 的增量校验

新任务按[产品契约](product-definition.md)提供固定 `product_spec_ref` 与 `feature_spec_ref`。PA只完成高层输入，Module按精确高层来源细化实施级Spec；每个必需Module须COMPLETED且产物验证通过，`feature-specification`匹配最终`feature_spec_ref`，并附`product_spec_ref`与实际`spec_handoff_ref`。裁剪独立Module只接受有理由、证据和最终详细规格引用的`simple_spec_refinement`，不能排除已知模块影响；内容充分性仍实际检查。只含高层不能使最终门禁就绪，旧未声明两阶段的元数据保持兼容。

`ui_delivery_mode: staged` 在每个必需UI阶段校验所选L1/L2/L3：L1保留概念图；L2增加真实`figma-design`（固定清单ref、tool=figma、真实figma_url、design_version）；L3另需`figma_confirmation`精确匹配设计ref/version和Owner确认来源、顶层固定`frontend_stack_ref`与`frontend_prototype_authorization_ref`，以及runtime=frontend、匹配stack及figma_design_ref的可运行`interactive-prototype`，沿用真实交互测试/可编辑源证据。WAIVED不替代新staged交付。新复杂UI默认此模式，简单复用须说明裁剪；旧未声明模式的证据不冒称完成新三阶段。门禁不检查远端Figma/权限或证明确认发生时间，Master/Reviewer核验真实工具、先确认后制作及批准技术栈和原型授权范围。

有两阶段Module且staged L2/L3时，Module的`ui_design_ref`匹配已确认Figma清单；实施细化消费中期源，无须依赖最终前端UI阶段完成，避免循环。阶段依赖仍保留必要SA批准及PA输入，所有来源变更重核受影响细化/原型/审查。原型制作授权不等于业务编码、合并或生产授权。

所有必需Module均检查批准系统基线匹配、必需模块产物及图工具版本，不能只检查首个或依赖清单顺序。staged任务若提交必需`interactive-prototype`，须选择L3并满足完整确认/原型授权/前端证据；不能把等级降为L1/L2隐藏前端交付，中期Figma点击仍记`figma-design`。

## 多阶段与任务级产物范围

所有必需 Solution Architect 和 Module Architect 阶段逐个检查角色必需产物和图工具版本。当前输入仍只有一个获批 `system_baseline_ref`；both 中每个 Module 必须直接依赖唯一一个实际提供该精确系统基线的 SA 阶段，其他系统阶段不得被默认为来源，重复来源不明确时阻断。调换清单顺序不能改变结论。

顶层 database/workflow 是任务级影响，从所有必需架构阶段的产物集合核验：database 需要 `database-schema` 与 `database-schema-diagram`，workflow 需要 `workflow-diagram`（图形证据沿用固定 diagram-design 版本、渲染和产物验证规则）。不要求无关模块复制同一套 SQL 或流程图。具体所有权及图与源的一致性仍由项目契约、consistency_checks 和实际 Review 核验，不以“首个模块”决定适用范围。

## 正式编排与当前设计绑定

仅在 `orchestration_validation_required: true` 时追加以下严格绑定；缺字段须补证，不以历史未绑定格式宣称当前任务执行完成：

- 顶层 Gate 与 `orchestration_chain` 的 `context_id`、`repository`、`task_contract_ref` 完全相同；repository 非空，Task Contract 为可引用的真实来源。
- 每个必需 PA/SA/Module/UI 阶段提供 `orchestration_binding: {dispatch_id, execution_id, task_contract_ref?}`。默认使用 Gate 的 Task Contract；确有角色专属契约时显式指定精确引用，对应 Dispatch 必须一致。链的每个 Dispatch 同属当前 repository。
- binding 唯一定位链的一项，dispatch/execution ID 与角色匹配；同一 Dispatch 不能代替两个必需阶段。允许实际运行时会话接续，但不得编造新运行 UUID。
- 每个绑定阶段必须实际 COMPLETED，全部必需 artifact.ref（含准确 SHA）被该项 Handoff.artifact_refs 覆盖。角色齐全、链内部自洽或 Owner 已读链接都不能替代任务与产物匹配。

这只检查调用方已核验元数据的交叉一致性，不认证链接、Owner 或远端运行时；已有真实 Execution/Handoff、授权与源核验仍不可省略。G-01 START_CODING 重新调用此 Gate，不能因外层 findings 为空而忽略内层已有拒绝/发现。
