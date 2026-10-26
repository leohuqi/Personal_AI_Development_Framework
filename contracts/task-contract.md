# Task Contract：一份任务说明即可开始

在现有 Issue、PR 或明确任务中维护；不要求 Owner 手填机器字段，不为每次分派重建文档。本契约引用已有批准，不自行授予权限。

## 默认只写六项

| 项目 | 最小内容 |
| --- | --- |
| 目标与验收 | 要完成的用户结果，以及可以观察/验证的通过条件 |
| 范围 | 本次做什么、不做什么；受影响功能或模块 |
| 人与下一步 | 交付负责人、实际执行者、接收/审查者；下一动作及停止/升级条件 |
| 输入 | 相关规格、设计、接口或代码的准确版本；复用已批准基线 |
| 交付 | 主成果或 PR、必要测试/审查证据、未完成项 |
| 授权与环境 | 真实 Owner 批准引用及范围、允许环境；不能从设计完成推导编码/上线权限 |

写法可以是六行正文；已有可观察验收或批准范围只引用一次。目标已清楚时不额外创建 PRD、研究报告或两套规格。跨角色交接参见[最小 Handoff](agent-handoff.md)；真人责任参见[小团队协作](../workflow/small-team-collaboration.md)。

例如局部缺陷任务可以描述：修复搜索无结果提示；不改查询和权限；张某负责，开发 Agent 执行，QA 接收；引用当前规格/代码版本；交付 PR 和空结果回归证据；引用该修复的有效编码授权、仅在隔离环境执行。示例不是实际批准。

## Agent 维护的来源信息

新执行按[进度协调契约](progress-reconciliation.md)设置`progress_reconciliation_required:true`，分别维护`parent_cr_id`、准确`execution_issue_id`、`execution_context_id`及绑定来源；有Work Package时父CR不能代替执行子任务。无父CR使用null；无Linear任务显式tracker=none。旧合同仍可读取，启用新同步前增量补准确绑定，不改写历史。

在同一任务的附录/现有记录里维护 context_id、仓库、任务 URL/ID、不可变 Feature ID、base/head SHA、Task Contract 永久引用、真实批准引用及当前状态。无 Linear 或 Feature ID 时写 N/A 并保留真实任务引用，不发明 ID。仅在有待处理消息、并行工作或恢复时引用对应 thread、工作区归属或检查点；不重复建立 STC、消息与交接正文。

每次执行前核对实时授权、来源和依赖，陈旧/冲突只阻断受影响动作。机器字段只能从已核验事实整理，缺失的授权、身份或测试证据不能自动生成。正式 Agent Message 的 envelope 仍按[共用协议](../workflow/agent-protocol.md)及原 schema 完整记录；上面的六项是阅读/填写入口，不是替代机器契约的新 schema。

## 只有发生相应影响才展开

| 触发条件 | 增加的必要输入 |
| --- | --- |
| 产品行为新增或变化 | product_scope: reuse/define/refine；适用 product_spec_ref、最终 feature_spec_ref 和 spec_handoff_ref；沿用[两阶段规格](product-definition.md)，简单任务可同文裁剪 |
| 系统/模块设计 | S/M/L/XL、impacts/risk_flags、architecture_scope 及理由；适用的获批准 system_baseline_ref、设计产物/依赖与准确版本 |
| UI | 任务所需 L1/L2/L3、项目 UI Profile；概念图确认后直接前端 Mockup，保留批准栈、原型授权和当前 Impeccable 审查，见[UI 契约](ui-design.md) |
| 跨系统接口 | 双方负责人、接口版本与兼容约定、联测环境/标准及阻塞；不以 mock 当双方联测 |
| 实施与验证 | 受影响 AC、必要测试/CI、QA 和独立 Review；迁移、安全、性能等仅按实际风险补充 |
| 真实 Agent 分派 | 按[Dispatch 契约](agent-dispatch.md)记录有限 scope_items、角色/动作、必要决策及真实 Dispatch → Execution → Handoff → Master 协调 |
| 受保护操作 | 按[Action Preflight](action-preflight.md)及[审批策略](../governance/approval-policy.md)核对本操作授权、准确版本和实时证据；生产增加准确产物、手册及回滚/恢复证据 |

字段可引用既有精确来源，不要求逐项新建文件。省略的是不适用材料和重复填写，不是已触发的强制证据。新设计仍须适用 Design Gate 和独立 DESIGN Review；设计、编码、合并、发布、验收、Done、生产是不同动作。

## 已批准范围内继续执行

Master 复用有效 authorization_ref / owner_approval_ref、精确 Task Contract、context_id、仓库、环境和有限 scope_items；启动、接续、返工或重试不重复请求同一批准。必要决策、允许角色/动作和范围不能由接收方自行删减或扩大。

分派授权不包含重大设计决策、业务编码、合并、发布、生产、破坏性操作或最终验收；另行有效授权仍可引用。重试先查已有执行，防止重复启动；版本、环境、授权或依赖变化时重新核对受影响部分。

完成时在原任务给出[Delivery Report](delivery-report.md)或等价事实和 Handoff；接收方实际 ACK 后继续授权工作。没有批准、没有独立审查或没有实测，必须如实保留待批准/BLOCKED/NOT RUN。
