# Task Contract — Template

> Copy the relevant fields into the Linear issue or the explicit Codex task. Do not fill with invented approvals or test results.

## Identity and authorization
- Project/repository:
- Linear issue URL and identifier:
- Original immutable Feature ID(s):
- Module / Cycle:
- Task class (S bug / M feature / L cross-module / XL product):
- Owner approval reference and scope:
- Authorized environment: prototype / local / isolated CI
- Base branch/commit or approved release:

## V0.2 shared context / communication
- context_id (stable project-task reference):
- Shared Task Context permalink/revision (or location to reconstruct it):
- Owner approval evidence link (not only a free-text assertion):
- Pending Agent Message thread IDs/links and unresolved blockers at dispatch:
- Last verified Git HEAD / spec revision / Linear observation time:
- Design/API handoff refs (if relevant):
- Recipient agent/role, expected next authorized action and stop conditions:
- Context loading profile: minimal / design / review (bounded by role):
- Session recovery/checkpoint permalink if continuing interrupted work:

A Task Contract grants no authorization without applicable Owner approval. Messages and checkpoints only reference or transmit already-authorized tasks.

## Master 持续分派范围

已批准的分派与启动无需逐次重新批准；记录可复用的 `authorization_ref`、`owner_approval_ref`、当前状态、精确 Task Contract 引用、`context_id`、仓库、环境及有限 `scope_items`（允许角色/动作、必要决策及精确版本）。按[Dispatch 契约](agent-dispatch.md)核验，不能由接收方扩大或删减。此授权不包含重大设计决策、业务编码、合并、发布、生产或破坏性操作、最终验收；另行批准的动作保留各自门禁。

## V0.3 design stage and dependency inputs (when applicable)
- Task class (S/M/L/XL) and risk flags / risk assessment rationale:
- Impact domains: architecture / api / database / workflow / integration / ui / shared-component / security / etc.:
- Master-selected `architecture_scope` (none/system/module/both), routing rationale and affected system/module boundaries:
- Applicable approved `system_baseline_ref` for module design; current architecture Owner approval and matching baseline revision:
- Required specialist stages (Solution Architect, Module Architect, UI Designer as applicable) and `padf.agent-dependency/v1` manifest permalink:
- System Solution Architecture Package: tech stack/framework, app-level code structure + diagrams; or unchanged approved baseline/N/A reason:
- Module Code Design Package: package/class/interface layout, implementation guidance + module diagrams; or N/A reason:
- UI package level L1/L2/L3 + approved project UI Profile revision, or N/A with reason:
- Design Handoff links and receiving agent ACK / NEEDS_REFINEMENT:
- Independent DESIGN Review decision/evidence (mandatory L/XL or risk-triggered S/M), otherwise Master skip rationale:
- Design Consistency Gate result/evidence `padf.design-gate/v1`:
- Owner material design approval (if changed) and **separate bounded coding authorization**:
- Review expected at exact artifact revisions; versions that changed invalidate relevant gate evidence.

This section is an extension of V0.2 contracts, not a second Task Contract or permission to execute from DESIGN_READY alone.

## Objective
- User-visible outcome:
- In scope:
- Out of scope:
- Business rules / invariants:

## Source documents — load only relevant parts
- Approved Feature Spec (file + section/commit):
- UI prototype / design baseline if applicable:
- API/database/architecture contract sections if applicable:
- Dependencies, with Feature ID and linked Linear blocking issue:
- Resolved blockers:
- Open questions requiring clarification:

## Acceptance criteria
| AC-ID | Behavior / observable result | Test type / expected evidence |
| --- | --- | --- |
| AC-1 | [specific observable behavior] | [pytest/API/PG/E2E/manual] |

Include success, invalid, empty/loading/error, authorization and regression cases when applicable.

## Implementation constraints
- Files/modules expected to be affected (indicative, not permission to broaden):
- Data source and fixture/real-data boundary:
- Migration/version/compatibility constraints:
- Performance/security/reliability constraints:
- Approval required for scope, architecture or environment changes:

## Execution and handoff
- Requested skill(s):
- Required tests / CI workflow:
- Independent review requirement:
- PR title: [Linear-ID] [Feature-ID] concise scope
- Required result: Delivery Report, PR URL, commit/head SHA, test/QA/review evidence, pending message dispositions and durable Agent Handoff/Checkpoint refs if applicable.
- Forbidden without separate owner approval: production deployment, destructive migration, credential changes, deleting live data, declaring owner acceptance.


## V0.3 Master-orchestrated specialist acceptance fields
For a real independent-specialist pilot (not ordinary chat drafting) record the [Dispatch Record](agent-dispatch.md): `dispatch_id`, `master_run_ref`, `target_role`, `target_skill_ref@SHA`, `execution_mode` (ROLE_SIMULATION/HUMAN_RELAY/RUNTIME_DISPATCH), expected artifacts, upstream `depends_on_dispatch_ids`, exact design and Owner approval refs, `dispatch_ref` and reason. Specialist execution must read this **before** starting and cite it in its receipt. A Task Contract or Agent Message **alone does not start an agent**.

## G-01操作前输入

保留操作引用[Action Preflight快照](action-preflight.md)：准确action/subject、原Owner授权及范围、项目规则/适用门禁、实时观测证据、Review执行/差异/条件、发现/依赖、摘要与执行前复核，实际工具回执及事后状态协调。引用既有授权/Delivery Report/Design Gate/Dispatch，不复制新批准体系；明确生产/原型/隔离环境。只读READY不能自行执行，普通请求不是例外。
