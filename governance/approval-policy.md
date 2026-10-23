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

- Master 负责整体问题推进、交付充分性、跨角色一致性、方案整合及就绪/依赖门禁；可要求返工并推荐取舍，不冒充独立设计审查，不替 Owner 批准重大决定，也不启动未授权开发。
- Solution Architect 提出应用级架构与技术选择；Module Architect 在已批准系统基线内完成模块设计，不能彼此替代或扩大框架范围。
- 专家提交有证据的提案与自检；设计 Handoff 不等于独立批准或编码授权。
- L/XL 及风险触发的 S/M 必须在精确设计版本上独立 DESIGN Review。Reviewer 可给出 APPROVE / APPROVE WITH CONDITIONS / REQUEST CHANGES，不能代替 Master 放行；缺少审查或存在 P0/P1 时 BLOCKED。
- 低风险 S/M 跳过审查须记录影响与理由；重大产品、架构或 UI Profile 变更无论规模都需 Owner 批准，P2 风险须明确接受。
- DESIGN_READY 后仍须单独的有边界编码授权和 Task Contract；只读评估器既不启动 Agent，也不验证真实权限。

## G-01：Owner请求不隐式豁免

六项保留操作必须经过[主动Preflight与实时复核](../workflow/action-preflight.md)，复用本政策现有Owner授权与Task Contract，不新建授权引擎或改变有界分派。Owner明确操作请求不替代适用CI/QA、独立Review/真实上下文/准确版本、关键依赖、P0/P1和明确验收。非强制项目可选规则例外须记录Exception ID/具体规则/任务HEAD/Owner明确例外/风险条件补救复核；强制规则不走普通例外。紧急路径另行批准审计，普通接口不能启用。合并、发布、生产、Owner接受和Issue Done不互相授予权限；Done须准确OwnerAcceptance，自动Done无证据为治理异常。

## 小团队的审查与决定

按[小团队协作](../workflow/small-team-collaboration.md)指定真人责任。技术负责人在有效批准范围/基线内可决定普通实现细节；Owner / PM 保留最终决定及本政策各类保留操作批准。技术审查、接口双方确认、业务验收和生产授权不互相替代；指定成员负责部署执行并不授予自行上线权。

可复用明确的迭代/功能范围授权，不要求每次提交、分派或范围内返工重批；真实范围/重大决定/环境变化仍升级。Master 给出可理解的推荐和影响，引用有效批准，不让人手填机器字段或阅读全部审计才能决定。简化不改变 G-01、独立性、真实版本或关键风险门禁，也不自动配置平台权限。
