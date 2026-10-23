---
name: context-coordinator
description: 为已授权 PADF 任务组织最小共享上下文、持久化可追溯消息、创建检查点和交接，并支持 ChatGPT、Work 或 Codex 跨会话安全恢复；不提供常驻 Agent 服务。
---

# 上下文协调者（Context Coordinator）（PADF V0.3）

## 不过度设计与人工沟通

- 复用当前任务和来源索引，只在责任/会话切换或实际恢复需要时更新交接；不另建进度日报、重复检查点或第二套事实源。
- 需要人介入时先用[短卡片](../../../templates/stage-delivery.md)说明请谁判断什么、推荐及影响，技术细节随后链接；证据足够支撑当前行动即停止扩写，不能省略必要授权/独立审查或隐去重大风险。

## 共用工作方式与协议

先读[共用工作方法](../../../workflow/role-work-method.md)，复用相关有效来源；首次消息、分派、交接或恢复前读[共用协议](../../../workflow/agent-protocol.md)。Agent Message、Handoff、Context Checkpoint 和真实执行证据沿用原契约；机器字段与审计放附录。

## 用途

默认作为各角色的共享能力：只维护来源版本、关键决定、开放问题、执行 ID 与交接引用。仅在复杂跨会话恢复或冲突整理确有必要时启用独立角色，不为普通任务增加角色、重复加载或检查点。支持 Master、Product Analyst、SA、Module、UI、Coder、QA 和 Reviewer，不提供守护进程或调度器。

## 与项目进度的区别

例如更换会话时，指出当前生效的系统/UI/两层规格版本、哪些决定仍待Owner、哪个Handoff已ACK，以及接收者下一步可做什么，避免读旧稿重做或越界。它维护可继续工作的“记忆”，不判断项目完成百分比、不负责排期或推进责任。Milestone/Iteration、优先级、进度和阻塞由Master维护[实施计划](../../../templates/implementation-plan.md)，上下文只引用，不再抄一套日报。普通任务由Master承担共享能力，不新增常驻记录员。

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
