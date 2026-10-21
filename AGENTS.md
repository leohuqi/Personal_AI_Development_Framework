# PADF 仓库规则

- PADF 是通用 Skill 与开发框架仓库，不是应用运行时。
- 项目专属领域规则放在接入项目或 `examples/<project>/`；通用 Skill 与契约使用中性术语。
- 核心说明以中文维护；Skill 名称、文件路径、命令、协议字段、schema 标识和状态枚举保留英文。优先更新同一份文档，避免两套正文发生漂移。
- 不默认加载无关项目文档。只读取已分配的任务、Feature Spec，以及受影响的架构、API、UI 和契约。
- 保留清晰的角色输入、输出、交接契约、审查独立性、验收及授权边界。
- 重大产品、UX 或架构变更、有边界的编码分派、生产操作、破坏性操作和最终验收由 Owner 批准。
- CI 通过、PR 合并、独立审查通过、Owner 验收和生产部署是不同事实，分别核验与报告。
- 已批准范围内的 Master 任务分派与启动复用现有 Owner 授权，无需逐次重新批准；优先使用可用的真实 Agent 运行时，保留分派审计、工具返回的执行 ID 和 Handoff。
- 该授权不扩展至重大设计决策、业务编码、PR 合并、发布、生产部署、破坏性操作或最终验收。新增 Linear Loops、自托管编排、常驻调度器仍须单独授权。

## CACF V0.2：共享上下文与通信

- 用分配的 Linear 任务与不可变原始 Feature ID 确定稳定 `context_id`，保留两类 ID 的区别。
- 按[共享任务上下文](contracts/shared-task-context.md)和[上下文加载策略](governance/context-loading.md)解析最小来源。GitHub 代码、已批准规格与 ADR，Linear 实时状态和 Owner 批准记录的优先级高于缓存笔记。
- 重要跨角色通信遵循[Agent Message 契约](contracts/agent-message.md)，保存在可持久化的 Linear 或 GitHub PR 讨论中，使用唯一 message/thread ID 并核验永久链接；消息持久化不代表自动唤醒或取得授权。
- 会话结束或角色交接前，在条件允许时生成简短、有引用的检查点/交接；恢复时核对实时任务、批准、Git head、规格版本和待处理消息，重大漂移时停止。
- Reviewer 根据批准需求和精确 diff 独立推理，不能导入 Coder 自审结论。
- V0.2 协议本身不创建运行时、调度器、消息代理、数据库或 A2A 服务，也不授予自主合并或生产操作权限。当前已授权会话可调用现成运行时，遵循下述 V0.3 分派规则。

## V0.3 专业设计规则

- Master 按任务路由所需 Architect/UI Designer，记录 S/M/L/XL 风险与跳过角色的理由；在已批准范围内主动分派并启动真实 Agent。
- 全新应用、平台技术栈、应用级代码结构或跨系统边界变更需要 Solution Architect 与版本化 Solution Architecture Baseline；已有批准系统应优先复用。
- 已批准基线内的模块 API、数据结构、流程、类与包设计交给 Module Architect，并匹配基线 SHA 与技术、视觉契约。Master 选择 system/module/both/none，不默认同时调用两类架构师。
- 两类架构师都提交结构化契约与有理由的图表；按要求使用固定版本 diagram-design。缺少渲染能力标记 BLOCKED/NOT RUN，不伪造证据。
- UI 变更读取项目自身已批准 UI Profile 并引用版本；概念、高保真与交互等级按复杂度选择，静态图不算交互源。
- 设计交接沿用 V0.2 契约。Master 协调就绪与批准路由，Independent Reviewer 对 L/XL 和风险触发的 S/M 执行 DESIGN 审查，Owner 批准重大设计和编码。
- V0.3 框架规则已进入 `main`；不可变 PADF v0.2.0 发布版本保持原样。主分支合并不自动创建新 Release。

## V0.3 可审计编排与 Owner 质量验收

- 真实 Master 编排须有 `Dispatch → independent Execution → Handoff → Master Dependency Reconciliation` 四阶段记录，包含精确永久链接、时间戳、Skill SHA、启动模式与产物源 SHA。同会话角色扮演属于 ROLE_SIMULATION。
- 只有真实工具返回的 task/run ID 能证明 Master 启动 Agent 时，才可宣称 RUNTIME_DISPATCH；HUMAN_RELAY 是 Owner 启动独立会话。
- Master 不得冒充专家或独立 Reviewer 生成证据。Owner 按[质量评价契约](contracts/skill-delivery-evaluation.md)分别评价 Solution Architect、Module Architect 和 UI Designer。
- 每次启动前核对当前授权状态、Task Contract、仓库、上下文、环境、角色、动作、范围和必要决策批准；范围变化、授权撤销或版本漂移时阻断。遵循[审批策略](governance/approval-policy.md)与[Dispatch 契约](contracts/agent-dispatch.md)。
- 下游任务解阻前核对前序 Handoff、基线批准和 Master 协调结论；缺少证据标记 BLOCKED/NOT RUN，保持 Owner 权限与设计审查要求。

## G-01：保留操作主动门禁

MERGE_PR、START_CODING、RELEASE、DEPLOY_PRODUCTION、OWNER_ACCEPTANCE、MARK_ISSUE_DONE前必须按[Action Preflight](workflow/action-preflight.md)核对实时证据、运行只读评估、执行前再次复核并使用原子HEAD匹配。Owner请求不是隐式Review/CI/QA/Acceptance豁免。真实独立执行与准确Base/HEAD缺失仍阻断；Merge不能自动Done，事后核对异常并在适用授权内补偿。v0.3.2有界分派权限不变。
