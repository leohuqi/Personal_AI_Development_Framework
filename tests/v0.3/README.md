# PADF V0.3 — Specialist Agent & Design Gate Validation

## 下一补丁：设计证据完整性回归

`node tests/v0.3/run-review-integrity-tests.mjs` 覆盖所有任务等级已有审查的拒绝与发现、多 SA/Module 顺序不变、任务级 schema/流程集合、正式编排任务与逐阶段精确产物绑定、legacy/staged 的合法 UI 等级和高保真源，以及 G-01 START_CODING 跨入口。包含完整正确输入和缺失/错版本的拒绝对照；全部为合成元数据，不证明真实授权、Figma 或运行时执行。CI执行同一入口。

正式编排旧输入须按[契约](../../contracts/design-gate.md#正式编排与当前设计绑定)补齐 repository/task_contract_ref 与 stage.orchestration_binding，并确保 Module Dispatch 的基线/状态/批准引用和 UI Dispatch 的 Profile 与当前 Gate 一致。多 SA 的 Module 依赖唯一精确基线提供者，不依赖任意首项。legacy L2/L3 补齐[可编辑高保真源](../../contracts/ui-design.md#三阶段交付等级与证据)；原 L3 正常测试夹具现在显式声明交互源 fidelity=high，而非默认为任意交互源都高保真。既有未开启正式编排验证的任务不新增绑定要求；未满足证据的历史输入应诚实BLOCKED。

## 下一版：产品成果与共用协议回归

运行 node tests/v0.3/run-product-tests.mjs
node tests/v0.3/run-feedback-tests.mjs，覆盖产品路由/正式设计依赖、仅 Catalog 拒绝、版本/批准边界、新 PA 真实模式元数据、可复用批准及共用消息草稿生成/回复/重试。CI 自动执行。元数据 PASS 不证明详细规格或方案实际有用；代表性 Skill 请求的独立运行另行记录在 PR，专业质量仍须读主成果。

## v0.3.2：Master 持续分派授权回归

`node tests/v0.3/run-orchestration-tests.mjs` 当前包含 36 组检查（原 19 组证据链 + 新增 17 组授权回归）。复用同一有效 Owner 批准允许范围内多次 REVIEW/TEST 及 context-coordinator 的 COORDINATE；必要决策精确版本获批时允许正式设计。越界、授权撤销、必要决策缺失/错误版本及未授权编码等保留动作均须阻断。校验器只检查调用方已核验的快照，不创建运行时权限；真实调用验证见[手册](../../workflow/master-orchestration-validation.md)。现有 CI 已执行同一测试入口。

## V0.3.1：R2 安全回归

`node tests/v0.3/run-tests.mjs` 新增 R2-01～03 回归矩阵：模块影响与显式 scope、S/M 的 impact-only 强制审查、UI Profile 状态/批准证据/精确版本绑定，以及低风险 UI、非 UI 和单独编码授权的正向对照。它们针对元数据门禁，不证明真实专家、Owner 决定或外部工具执行。

旧 UI 测试输入须提供 `ui_profile_status: APPROVED`、`ui_profile_approval_ref` 和与 `ui_profile_ref` 相同的 `ui_profile_approved_ref`。数据库正向用例使用已批准系统基线下的模块阶段，不再借 system scope 绕过模块设计。新增反例在未修复实现上应失败；门禁修复后全套通过。

## Automated checks (declarative, not a running agent platform)

```bash
node scripts/validate-cacf.mjs
node --check lib/design-gate.mjs
node --check tests/v0.3/run-tests.mjs
node tests/v0.3/run-tests.mjs
```

72 deterministic fixture tests exercise explicit system/module/both/none routing and APP-vs-module artifact responsibilities, approved system baseline SHA/Owner approval, ordered system-to-module dependency, mandatory L/XL design review, S/M risk escalation, stage graph validity, blocked/STALE dependencies, immutable artifact references, project UI Profile version match, structured Architecture+diagram alignment, database source+diagram, L3 interactive prototype, handoff review versions, Owner approval and coding authorization separation. Test numbers are determined from the actual suite. **No external diagram-design execution or UI generation is implied.**

## Manual independent specialist-agent pilot — NOT RUN until separately executed

Use an isolated **non-PQA** sample Feature and approved sandbox with a stable issue, immutable Feature ID and sample data; no production data.
1. Master classifies L/XL or S/M scope/risks, chooses `architecture_scope` and builds minimal Stage Dependency manifest; record excluded/included roles and why. Select an approved existing architecture or first establish one by Solution Architect.
2. For a new expense APP, **Solution Architect** resolves pinned diagram-design and produces concrete technical stack/framework decision, high-level APP code/module topology, system boundaries and matching diagrams. For an expense-import module in an existing APP, **Module Architect** reads an approved system baseline and produces actual package/class/interface code design, workflows and a matching module diagram — without changing the system stack. Test BOTH with SYSTEM -> MODULE and approved baseline version handoff.
3. UI Designer reads the project's approved UI Profile, produces concept, high fidelity or working interactive prototype by justified level, checks responsive and interaction states. Record real paths and revisions; no invented Figma assets.
4. Designers publish V0.2 Design Handoffs and actual artifact SHA; recipient ACK or NEEDS_REFINEMENT. Test an upstream revision change and expect STALE/blocked downstream.
5. In a separate fresh Reviewer session, inspect approved Feature Spec and exact artifact revisions. For L/XL independent DESIGN Review is mandatory. Test a P1 rejection and a P2 with/without Owner risk acceptance.
6. Master assesses Design Gate, verifies Owner material decisions and separately requests coding authorization. Check DESIGN_READY without coding authorization cannot trigger coding.
7. Optional separately authorized Coder/QA pilot verifies implementation conforms to approved design; this is **not** part of automated unit simulation.

Record external plugin revision, actual artifact permalinks, screenshot/browser validation, Coder authorization, risk decisions, reviewed SHA, PASS/FAIL/BLOCKED/NOT RUN and session boundary evidence. Missing external tool, project design profile or interactive prototype means BLOCKED/NOT RUN, not PASS.

## Rollout policy
当前正式版本为 v0.3.4，参见[版本说明](../../docs/releases/v0.3.4.md)。V0.3 的原始有边界设计试点已完成 Owner 验收，历史证据保持原样；各项目采用新版本仍须明确批准并固定 tag/SHA。历史发布标签不可变，框架升级不自动改变 PQA 的接入或授权状态。


## New V0.3 Master orchestration + Skill quality tests
```bash
node --check lib/orchestration-evidence.mjs
node --check lib/skill-delivery-quality.mjs
node tests/v0.3/run-orchestration-tests.mjs
node tests/v0.3/run-skill-quality-tests.mjs
```
These are **synthetic metadata** fixture checks. They do not authenticate actual agent session identity, initiate Work/Codex, verify a real diagram/prototype or make an Owner decision. For a real test use [independent Master runbook](../../workflow/master-orchestration-validation.md), separate specialist sessions with only Master dispatch permalinks, and [Owner scoring sheets](../../contracts/skill-delivery-evaluation.md). Old [Issue #4](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/4) stays ROLE_SIMULATION, not a pass for real orchestration.

## 历史真实验收证据
[PADF Issue #5](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/5) 的设计试点已完成；参见[Owner 验收](../../examples/issue-5-acceptance/OWNER-V0.3-ACCEPTANCE.md)。新试点仍需独立会话、执行证据及单独质量评价；不将既有验收或 Issue #4 的角色模拟当作新的实际运行证明。

G-01新增：`node tests/v0.3/run-preflight-tests.mjs`，只验证操作预检/Review证据/例外/TOCTOU/生命周期的合成快照，不认证平台或真实批准。原持续Dispatch授权回归仍执行。
