# 按问题、变化与风险路由角色

先按[共用工作方法](role-work-method.md)判断输入：方向缺口问 Owner，目标明确方案未定主动研究，已有有效规格复用，增量只补变化。先定义有用成果，再安排角色；没有必要不启用全部九个角色。

| 工作类型 | 最小路径 |
| --- | --- |
| S 局部缺陷/明确的小改动 | 批准范围与现有规格 → Coder → 针对测试 → 风险审查；无需重复产品/系统/UX研究 |
| 目标清楚但产品行为缺失或变化 | Product Analyst出High Level Specs/Catalog与业务验收 → SA初评/复杂度与UI → Master计划/Handoff → Module细化实施级Spec → 所需设计 |
| 新产品/重大系统变更 | PA 产品定义（或复用有效规格）→ SA 完整系统方案 → 批准基线内所需 Module/UI → 设计门禁 |
| 已批准系统内的模块/API/数据/工作流 | 复用详细规格与 system_baseline_ref → Module Architect；不重复选系统技术栈 |
| UI 方向不清/复杂体验 | 产品任务与共享研究 → UI IA/流程 → 少量差异概念/取舍 → Owner反馈 → 所需高保真/交互 |
| 明确局部 UI | 复用批准 Profile、产品行为与设计，只改受影响部分 |

## 产品与架构范围

可选 `product_scope: reuse | define | refine`，省略时保留 v0.3.2 有效规格复用路径。`new-product` 未指定范围时默认补定义；已有完整有效获批规格时可明确 reuse，技术设计仍需 SA，不重复产品研究/PA。`product-definition/product-behavior` 表示本次仍需定义/修订的行为，不能用 reuse 掩盖；define/refine 要求产品级High Level Spec与Catalog；正式实施前Module结合SA/UI细化，简单任务可合并。PA 是产品/功能设计角色，不批准重大方向，不编写应用实现。

Master 按实际 `impacts`、`risk_flags` 和版本化来源选择 `architecture_scope: none | system | module | both`：
- solution-architect：新应用、整体技术栈/平台/部署/系统边界；交付连贯[系统方案](../contracts/solution-architecture.md)，含职责依赖、接口/数据、正常/失败运行、技术取舍、质量和演进。目录/图表不代替正文。
- module-architect：批准基线内的模块包/接口/数据/算法/事务并发/存储迁移/异常/测试设计；产品行为缺口回 PA/Master，不临时设计需求。
- both：确需改变系统基线且要详细模块设计，按 SYSTEM → MODULE 和精确批准版本衔接，不因 L/XL 自动调用两类架构师。
- none：无架构变化，引用现有基线。已知系统影响要求 system/both，模块影响要求 module/both，不能由 scope/N/A 理由排除。
- ui-ux-designer：UI/导航/共享组件/交互影响；复用项目批准 UI Design Profile，以任务/研究/概念逐步收敛，按复杂度选 L1/L2/L3。

正式设计依赖本阶段产品定义；研究可在无依赖条件下并行。`routeAgents` / Design Gate 只检查声明与来源元数据，不判断文档真实质量或自动启动角色。

## Master、审查与上下文

Master 检查[主成果](../contracts/role-deliverables.md)、跨角色一致性和不必要复杂度，整合取舍并退修明显不足；L/XL 和风险触发 S/M 必须独立 DESIGN 审查。强制风险同时读取 impacts/risk_flags，普通低风险跳过须说明理由。重大产品/架构/UI 决策仍 Owner 批准，DESIGN_READY 不等于业务编码授权。

Context Coordinator 默认是当前角色的共享能力，只有复杂跨会话/冲突整理确需独立任务时分派。Shared Task Context 只放最小来源；消息和 Handoff 遵循[共用协议](agent-protocol.md)。fresh-context Reviewer 只读批准来源、精确 diff 与证据，不继承 Coder 自审。

默认单一 Coder；并行实现须明确互不重叠的范围、隔离工作树与适用授权。已批准范围内 Master 优先真实运行时分派/接续，不逐次重批；缺能力才 HUMAN_RELAY，不新建调度器或后台服务。

## Profile 与职责范围独立

Master先依据[架构方法](../standards/architecture/README.md)选设计深度，再按原architecture_scope决定角色；不要把Full等同both，或把Lite等同无风险。可运行 node scripts/recommend-architecture.mjs task.json 获取[只读建议](../lib/architecture-profile.mjs)；它使用现有路由并额外读取当前变化复杂度/基线/受影响运行节点与变更外部依赖，不修改旧消息、Gate字段或返回授权。

未知或冲突先补必要输入，不能默认Lite。S权限、删除/恢复或同步需专门考虑运行/数据/安全与Review；方法建议的review_recommended不改变既有independent_review_required。新风险应由Master按实际语义归到现有风险分类并安排适用审查，不靠未知字符串绕过。给下游只路由当前相关资料，完整规范有唯一维护位置；详细方法和复用/迁移边界见上文链接。
