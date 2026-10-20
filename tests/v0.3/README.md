# PADF V0.3 — Specialist Agent & Design Gate Validation

## Master 持续分派授权回归

`node tests/v0.3/run-orchestration-tests.mjs` 当前包含 35 组检查（原 19 组证据链 + 新增 16 组授权回归）。复用同一有效 Owner 批准允许范围内多次 REVIEW/TEST；必要决策精确版本获批时允许正式设计。越界、授权撤销、必要决策缺失/错误版本及未授权编码等保留动作均须阻断。校验器只检查调用方已核验的快照，不创建运行时权限；真实调用验证见[手册](../../workflow/master-orchestration-validation.md)。现有 CI 已执行同一测试入口。

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

38 deterministic fixture tests exercise explicit system/module/both/none routing and APP-vs-module artifact responsibilities, approved system baseline SHA/Owner approval, ordered system-to-module dependency, mandatory L/XL design review, S/M risk escalation, stage graph validity, blocked/STALE dependencies, immutable artifact references, project UI Profile version match, structured Architecture+diagram alignment, database source+diagram, L3 interactive prototype, handoff review versions, Owner approval and coding authorization separation. Test numbers are determined from the actual suite. **No external diagram-design execution or UI generation is implied.**

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
V0.3 remains a Draft PR pending Owner approval and independent review. The v0.2.0 release/tag is immutable; PQA Draft PR #7 is untouched. Do not adopt V0.3 in PQA before an explicit separate authorization.


## New V0.3 Master orchestration + Skill quality tests
```bash
node --check lib/orchestration-evidence.mjs
node --check lib/skill-delivery-quality.mjs
node tests/v0.3/run-orchestration-tests.mjs
node tests/v0.3/run-skill-quality-tests.mjs
```
These are **synthetic metadata** fixture checks. They do not authenticate actual agent session identity, initiate Work/Codex, verify a real diagram/prototype or make an Owner decision. For a real test use [independent Master runbook](../../workflow/master-orchestration-validation.md), separate specialist sessions with only Master dispatch permalinks, and [Owner scoring sheets](../../contracts/skill-delivery-evaluation.md). Old [Issue #4](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/4) stays ROLE_SIMULATION, not a pass for real orchestration.

## Open real acceptance issue
Follow **[PADF Issue #5](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/5)** in fresh, distinct Master/Solution/Module/UI/Reviewer sessions, with only Master-written durable Dispatch URL passed to each specialist and separate Owner grading sheets. **Do not reuse Issue #4** as evidence of independent invocation; it is a role-simulation negative control.
