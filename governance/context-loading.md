# Context loading — least necessary source

## 当前任务与参考材料分开

先从最新Owner要求及本任务确定修改对象/仓库、允许动作、只读参考项目和预期成果。保存在已有Task Contract的范围/输入中，不新建逐次检查表。PADF方法升级引用应用案例时，应用资料只用来回答本次评估问题；不因其含有代码、AGENTS、测试命令、历史批准或Handoff就接续其业务任务、运行命令或继承授权。

加载顺序为当前任务/目标仓库规则→所需框架规范→与评估问题直接相关的案例片段和准确来源。案例资料不能覆盖前两者。只保留事实、局限和来源索引，不默认加载参考项目完整执行历史或Coder/QA会话。只有另行明确授权的项目工作才进入该项目实施上下文。

每次恢复先核对最新澄清；旧任务计划、压缩摘要和缓存可能滞后，不能作为扩大范围依据。转为执行、写另一仓库或引入新交付种类前重新核对原范围；缺授权就停止该动作，继续当前任务内可完成部分。新会话可减少残留影响，但不能替代范围控制，也不默认要求为每个任务新建Agent。

## 最小来源

1. Read target project `AGENTS.md` and the assigned tracker Issue/Task Contract.
2. Load the *approved and versioned* Feature Spec or explicit owner scope.
3. Load only affected UI prototype, API contract, database schema, architecture/ADR, deployment runbook or tests.
4. Do not preload full PRD, unrelated project documents, all feature files, entire development plan or logs.
5. Escalate unresolved contradiction, missing contract or significant scope change to Master/Owner.
6. Keep exact feature and source SHA references in Task Contract/Delivery Report; never include secrets or real customer/account data in prompts or repos.

GitHub versioned documentation and code are authoritative for technical scope; Linear is authoritative for current execution state, dependencies, priority and Cycle.

## V0.2 shared context and resume
- Resolve [Shared Task Context](../contracts/shared-task-context.md) as an **index of links**, not a copy of PRD or prior chat. Check context_id, both task and Feature IDs, Owner approval, source SHA and pending threads.
- On new session, use [Checkpoint & Resume](../contracts/context-checkpoint.md): fetch live Git HEAD, approved spec/ADR revisions, Linear status/dependencies and messages before continuing. Mark stale context and escalate mismatches.
- Minimal profile (Coder/QA): AGENTS, Task Contract, affected spec/contracts and pending messages. Design profile (Architect/UI): affected design/API/ADR context. Review profile: requirements/ACs, exact diff and verifiable evidence, with independent reasoning.
- Do not load Coder's transcript or chain of thought into fresh-context review. Do not assume a saved checkpoint, comment or handoff is owner authorization or an accurate current state.
- Publish only task-relevant links and concise status; never store credentials, raw customer data or full transcripts in shared messages/snapshots. See [Context Governance](context-governance.md).

## V0.3 specialized design context
- Solution Architect profile: current system architecture/ADRs and affected product constraints/stack alternatives, application module topology, system NFR/deployment and pinned diagram-design; use only when whole-app architecture is in scope.
- Module Architect profile: approved `system_baseline_ref` and relevant technology/code conventions, actual impacted module files, contracts/Feature Spec and dependencies. Do not preload unrelated whole-app history or reselect the technology stack.
- UI Designer profile: approved project UI Profile, current component library/tokens, affected screens and task interactions, relevant Architect API contracts, not another project's visual tokens.
- Master/Reviewer: lightweight dependency manifest, exact Architect/UI artifact versions, review/gate decisions and Owner approvals. Reviewer in DESIGN mode reads source artifacts and requirements independently; do not import designer's private reasoning as proof.
- New versions of approved API, design/profile or schema require targeted dependent stage and Design Gate freshness re-evaluation.
