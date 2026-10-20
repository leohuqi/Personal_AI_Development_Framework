# Owner 审批策略与风险门禁

| 操作 | 授权要求 |
| --- | --- |
| 读取已连接项目及仓库 | 已授予权限内允许 |
| 起草需求、设计或计划 | 批准范围内允许；变更已批准范围前须由 Owner 决策 |
| Master 分派并启动范围内的分析、设计提案、基线内设计、测试或独立审查 | 复用现有有效的 Owner 授权与 Task Contract，无需逐次批准；优先使用可用真实运行时 |
| 启动业务编码 | 单独明确、有边界的 Owner 编码授权及 Task Contract；设计就绪或分派授权不能代替 |
| 决定重大业务、架构、UI 契约或接受风险 | 适用的 Owner 明确批准 |
| 合并 PR、创建发布 | 单独适用的 Owner 授权及项目 CI/审查规则；分派授权不包含这些操作 |
| 将新 Issue 标记 Done / 最终验收 | 明确适用的 Owner 验收 |
| 生产部署、破坏性迁移、密钥轮换或删除 | 单独明确的 Owner 批准及回滚方案 |

CI 通过、PR 合并、独立审查、Owner 验收与生产部署分别核验。P0/P1 阻断；P2 必须修复或由 Owner 明确接受风险条件；P3 可延期。Reviewer 必须评估实际更新后的 SHA。

## Master 持续分派的授权边界

Owner 批准任务及分派范围后，Master 可在当前获授权任务中完成角色选择、启动、范围内返工、测试和独立审查。不得为相同有效范围的每次启动、接续或重试重复请求 Owner 批准。实际调用优先使用现成 Agent 运行时；缺少该能力时如实采用 HUMAN_RELAY，请 Owner 协助启动会话，这是能力限制，不是新增审批门禁。

每次调用前，核对权威来源中的授权仍有效，精确 Task Contract、`context_id`、仓库、环境、范围项、角色和动作均匹配，并满足必要决策批准及依赖。先持久化 Dispatch，再调用工具，记录真实执行 ID、Handoff 和 Master 协调结论。重试先核对已有执行状态，避免重复启动；已完成、取消或撤销的范围不得继续。

范围、版本或环境漂移，授权缺失/撤销，必要决策尚未批准，或要求进入未授权编码等保留操作时，阻断对应动作并说明所缺批准；可独立进行且仍在范围内的工作可继续。SYSTEM 提案不是已批准基线，UI Profile 创建授权不是重大视觉决策批准。审批记录、任务消息和只读校验结果均不授予工具权限。

机器可检查的范围快照及分派前校验见 [Dispatch 契约](../contracts/agent-dispatch.md)。它只表达已有授权；实时来源核验由 Master 和接收方负责，不能伪造批准或用缓存状态替代。新增后台服务、调度器或无人值守范围仍须另行授权。

## V0.2 消息与上下文

- TASK_REQUEST / HANDOFF 只传递已批准范围，不制造或扩大授权。
- CLARIFICATION_REQUEST/RESPONSE 可解释已有契约；影响业务、架构基线、UX 或权限的 CHANGE_REQUEST 须先取得适用 Owner 批准并更新权威来源。
- REVIEW_FINDING/BLOCKER 不授予自动编码或合并权限。
- Checkpoint、缓存与评论不能覆盖已批准契约。正式来源冲突或批准过期时停止受影响动作。
- 持久消息本身不会启动 Agent；真实启动由 Master 调用已有运行时或 HUMAN_RELAY 完成，参见[上下文通信流程](../workflow/context-communication.md)。

## V0.3 Design Gate：已批准模型 C

- Master 负责路由、就绪与依赖门禁；不冒充独立设计审查，也不启动未授权开发。
- Solution Architect 提出应用级架构与技术选择；Module Architect 在已批准系统基线内完成模块设计，不能彼此替代或扩大框架范围。
- 专家提交有证据的提案与自检；设计 Handoff 不等于独立批准或编码授权。
- L/XL 及风险触发的 S/M 必须在精确设计版本上独立 DESIGN Review。Reviewer 可给出 APPROVE / APPROVE WITH CONDITIONS / REQUEST CHANGES，不能代替 Master 放行；缺少审查或存在 P0/P1 时 BLOCKED。
- 低风险 S/M 跳过审查须记录影响与理由；重大产品、架构或 UI Profile 变更无论规模都需 Owner 批准，P2 风险须明确接受。
- DESIGN_READY 后仍须单独的有边界编码授权和 Task Contract；只读评估器既不启动 Agent，也不验证真实权限。
