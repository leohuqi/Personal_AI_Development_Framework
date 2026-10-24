# Agent Handoff：让下一位能继续

Schema：padf.agent-handoff/v1。交接传递任务责任和可核验产物，不传递私有推理或新增权限；人、角色、会话之间都可交接，不需要新平台。

## 默认回答六个问题

| 问题 | 内容 |
| --- | --- |
| 交给谁做什么？ | 发送者、实际接收者/角色、任务和下一授权动作 |
| 已完成什么？ | 结果、主成果链接及准确版本；只报实际完成 |
| 还缺什么？ | 未完成项、关键阻塞、待决问题和负责方 |
| 怎么验证？ | 必要检查的 PASS/FAIL/BLOCKED/NOT RUN 与实际证据；没有执行不能写 PASS |
| 依据什么继续？ | 原 Task Contract、批准范围及相关规格/基线版本 |
| 何时停止？ | 范围/版本/授权冲突、依赖缺失或其他具体升级条件 |

直接写在原 Issue/PR 线程，引用已有来源；不另建相同的“交接报告、检查点和摘要”三份正文。接收方读来源、核对实时授权及版本后，简短回复 ACK（范围/版本）或 NEEDS_REFINEMENT/BLOCKED（具体缺口）。未收到实际确认就是待接收；ACK 不等于验收、批准设计、编码或部署。

## Agent 维护的正式记录与兼容

上面是人工阅读视图，不改变既有 schema 或必需语义。正式交接在同一记录或其准确引用中保留以下信息，由 Agent 从真实来源整理，人无需逐项手填：

- schema_version: padf.agent-handoff/v1；唯一 handoff_id、稳定 context_id、任务/Linear 引用及原始 Feature IDs（不适用明确 N/A）、sender/receiver、created_at。
- task objective/scope、task_contract_ref、owner_approval_ref、next_authorized_action、stop_conditions。
- source_baseline：规格及相关 ADR/API/UI 的准确版本，适用 PR URL、base/head SHA、分支；completed_with_evidence、not_completed、test_status。
- pending_message_ids、blockers、开放问题/依赖/风险；并行时的工作区责任和集成边界。
- 实际 handoff_ref 永久链接及接收方 ACK/NEEDS_REFINEMENT 的证据。

已有字段和批准可引用精确来源，但不能删除必需语义、用“继承”掩盖缺失内容，或让下游猜测。重试保留同一逻辑交接身份，查询原记录；有变化追加版本，不覆盖历史。按[消息契约](agent-message.md)保留 HANDOFF envelope、关联 ID 及实际状态，可与交接正文/所需检查点放在同一持久记录，不必分开发相同内容；记录位置合并不消除真实先后顺序。分派必须先于执行，执行者提交与 Master 协调仍分别保留真实作者/来源、时间及引用。

## 接收与停止

1. 核对任务身份、允许动作、当前授权及来源版本，读取有关未决消息；陈旧或缺必需输入时指出具体阻塞。
2. 实际打开产物和证据后 ACK；完整性或含义不清时退修，不让 Owner 重述已记录事实。
3. 只继续已授权工作；下次责任/会话边界再增量交接，普通进度更新不自动生成一套新记录。

独立 Reviewer 只用交接定位批准需求、准确 diff 和证据，不导入 Coder 自审结论/私有推理。消息或 ACK 不会自动启动 Agent，也不批准合并、生产或扩大范围。

## 适用设计与真实执行时补充

- 设计交接用 handoff_kind: DESIGN，引用实际[系统/模块架构包](architecture-design.md)、[UI 包](ui-design.md)、精确批准基线及清单；仅补本次受影响的接口、约束、设计决定与未决冲突。
- Module 接收批准的 system_baseline_ref；适用 UI 概念图、产品/实施级规格和 Profile 均需版本匹配。PROPOSED 系统不能作为获批准约束。设计者 COMPLETED、独立 DESIGN Review、Master Design Gate 和 Owner 批准分别记录，不由 Handoff 推导。
- 验证真实 Master 编排时保留 dispatch_id、工具返回的 execution_id、skill_ref_used@SHA、实际执行会话/回执、产物源 SHA 和 Master 读件/协调证据；见[Dispatch 契约](agent-dispatch.md)。六行摘要不替代这些证据，Master 代写不能证明专家执行。
- 真人工作保留真实姓名/账号、动作、版本及接收记录；不为真人捏造 Agent ID，不把人工交接标为 RUNTIME_DISPATCH，也不声称当前机器门禁已认证真人。需要现有门禁的真实独立 Agent 证据时仍须提供，不能用人工简表绕过。

同一主成果可承载多个设计章节并在清单定位，不要求每个字段单建文件。缺图表、原型、审查或执行能力时如实标记 BLOCKED/NOT RUN，不因“简化”宣布完成。
