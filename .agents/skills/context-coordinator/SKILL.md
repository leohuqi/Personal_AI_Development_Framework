---
name: context-coordinator
description: 为已授权 PADF 任务组织最小共享上下文、持久化可追溯消息、创建检查点和交接，并支持 ChatGPT、Work 或 Codex 跨会话安全恢复；不提供常驻 Agent 服务。
---

# 上下文协调者（Context Coordinator）（PADF V0.3）

## 最小持久消息模板（Agent Message）

以下 8 行 YAML 包含消息必填字段；用实时核验的任务事实替换占位符。Skill 统一标识 PADF V0.3；沿用 V0.2 契约与 `padf.*/v1` 协议，不因中文化更改字段或枚举。

```yaml
{schema_version: padf.agent-message/v1, message_id: "<unique-message-id>",
 thread_id: "<thread-id>", in_reply_to: null, context_id: "<project-task>",
 project: "<project>", repository: "<owner/repo>", linear_issue: "<canonical-issue-url>", original_feature_ids: ["<feature-id>"],
 sender: context-coordinator, receiver: "<accountable-role>", created_at: "<ISO-8601-with-offset>",
 type: CLARIFICATION_REQUEST, priority: NORMAL, subject: "<subject>",
 body: "<question-or-finding>", source_refs: ["<immutable-url-or-path@SHA>"],
 requested_action: "<bounded-action>", requires_response: true,
 status: OPEN, resolution_ref: null, owner_approval_ref: null}
```

按实际情况选择消息类型、优先级和是否需要回复。回复沿用 `thread_id` 并设置 `in_reply_to`；重试保留同一不可变内容与 `message_id`。依赖授权时填入 `owner_approval_ref`，TASK_REQUEST 还须在 `source_refs` 引用已批准 Task Contract。HANDOFF 引用完整的[Agent Handoff](../../../contracts/agent-handoff.md)，不能用消息模板替代交接或[Context Checkpoint](../../../contracts/context-checkpoint.md)；编写这两类记录前须读取各自必填项。按[Agent Message 契约](../../../contracts/agent-message.md)核对后，写入获授权的任务/PR 并验证永久链接。缺少来源或持久化能力时报告 BLOCKED/NOT_PERSISTED，不编造字段或宣称已送达。

## 用途

这是程序性 Skill，通过权威 GitHub/Linear 记录支持 Master、Solution Architect、Module Architect、UI Designer、Coder、QA 和 Reviewer 的跨会话协作，不提供 Agent 守护进程、工具 API、消息服务或自动调度器。

## 输入

目标项目和仓库、任务或 Linear 链接、不可变原始 Feature ID、目标、角色、已有授权和 Task Contract，以及共享上下文、检查点、交接和消息引用。

## 逻辑操作

以下是操作流程名称，不是预安装命令。

- `initialize_context`：根据实时任务、GitHub 版本和已批准 Task Contract 建立或引用[共享任务上下文（Shared Task Context）](../../../contracts/shared-task-context.md)。
- `resolve_context`：选择当前角色所需的最小源引用，避免全量加载项目文档。
- `record_message`：验证[Agent Message 契约](../../../contracts/agent-message.md)，写入获授权的任务或 PR 线程并确认永久链接；不可用时返回 NOT_PERSISTED/BLOCKED。
- `read_messages`：拉取同一 context_id 下当前角色负责的未解决消息，比较源版本，按实际读取情况记录确认。
- `create_checkpoint`：按[Context Checkpoint 契约](../../../contracts/context-checkpoint.md)在支持的持久位置保存最小检查点并记录 URL。
- `resume_context`：继续执行前核对实时授权、规格、Linear、Git HEAD、依赖和消息，发生漂移标记 STALE/BLOCKED。
- `prepare_handoff`：按[Agent Handoff 契约](../../../contracts/agent-handoff.md)记录产物与 SHA，发布 HANDOFF 消息，由接收方 ACK 或请求细化。
- `reconcile_context`：按[上下文治理](../../../governance/context-governance.md)识别并升级冲突，不静默覆盖已批准来源。
- `compact_context`：用来源引用、决策、证据、未决项和下一授权动作代替会话历史堆积，保留审计链。
- `finalize_context`：引用最终报告、关闭已解决消息、提出源文档更新并核对 Owner 验收门禁，不代 Owner 宣布验收。

## 开始前

1. 读目标项目 AGENTS.md、分配的 Task Contract 和任务。
2. 确定角色与当前授权；实施代码须有明确批准范围。
3. 解析 STC，核对权威版本、Git base/head 和 Linear 依赖。
4. 仅拉取相关未解决消息及受影响的 Feature、架构、UI 和 API 章节。
5. 授权缺失、版本冲突或无法持久化时停止，并说明精确阻塞。

## 执行中

- 重要跨角色问题和结论采用简短类型化消息，带 message_id 和 thread_id。
- 允许同一运行环境内讨论；重要结果须回写并验证永久链接。
- 重大范围、产品、UX 或架构决定须按规则取得 Owner 批准；不能以提议替代批准。
- 不建立互相冲突的第二套事实源，不保存 Agent 私有推理。

## 交接与恢复

- 在检查点记录证据和下一授权动作；更换负责角色时再发布 Handoff。
- 新会话重新读取实时来源，不能仅凭检查点写有 In Progress 就继续。
- fresh-context Reviewer 仅消费批准需求、精确 PR diff 与可核验证据，不预加载 Coder 推理或接受其自审结论。

## V0.3 专家产物与依赖

- STC 仅保存引用：应用级 Solution Architecture Baseline、Module Code Design Package、UI Design Package、精确 system_baseline_ref、真实图表和原型、项目 UI Profile 及阶段依赖清单。
- 设计交接或恢复前，对比已批准 SYSTEM SHA、受影响模块规格/API/schema/UI Profile 版本、设计包和 DESIGN 审查证据；漂移时标记 STALE/BLOCKED 并提交 Master。
- 不另建 Handoff 或消息协议，不自动唤醒专家，不把提案改称已批准。

## 输出与安全边界

简述 context_id、权威引用及版本、观察到的任务/head 状态、待处理消息、已验证的检查点与交接永久链接、风险、阻塞和下一负责角色。区分 CREATED/PERSISTED 与 DRAFT/NOT_PERSISTED。

V0.2 不引入后台编排、自动唤醒或分派、新存储服务或 A2A 运行时。不得推定获得更高权限、部署、破坏性操作或合并授权。遵循[上下文通信](../../../workflow/context-communication.md)和[审批策略](../../../governance/approval-policy.md)。

## V0.3 编排证据

按[Agent Dispatch 契约](../../../contracts/agent-dispatch.md)管理 dispatch_id、execution_id、Handoff 和 Master 协调引用。记录真实执行模式和来源，不制造运行 ID，也不声称 TASK_REQUEST 自动唤醒接收方。同一会话同时产出所有设计和 Master 决策时仍为 ROLE_SIMULATION。恢复时先核对前序 Handoff、现有授权与产物 SHA，再允许后续依赖任务。只转交最小上下文与精确 Skill@SHA，不复制其他 Agent 私有对话。
