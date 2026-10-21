# 共用 Agent 协议：按需读取，成果优先

首次发送消息、真实分派、交接或恢复前，必须读取本文件及对应契约的必填项；未读取不得凭记忆自由填写。协议用于已获授权的工作，不增加角色或审批轮次。简单同角色任务不为留痕创建无意义消息；实质决定、跨角色交接和真实执行必须可核验。

## 消息（Agent Message）

以[消息契约](../contracts/agent-message.md)为唯一语义来源。共用[最小 YAML 模板](../templates/agent-message.yaml)集中维护，不在九个 Skill 中复制。使用 `node scripts/create-agent-message.mjs <input.json>` 可生成 schema、唯一 message/thread ID、时间和初始状态；输出只是 DRAFT / NOT_PERSISTED，工具不发送、不授予权限或认证来源。

可从[内容输入示例](../templates/agent-message-input.json)填入真实事实；示例占位符不能直接发布。输入真实任务事实、发送/接收角色、类型、问题/结论、来源和下一动作；来源缺失不编造。TASK_REQUEST 须引用有效批准与有边界 Task Contract；消息本身不制造授权。回复保持 thread_id 并设置 in_reply_to；同一逻辑消息重试使用已生成的原输出，保留 ID、时间与不可变内容，先查询原记录防止重复副作用。已解决状态依契约追加记录，不能用生成器覆盖历史。

发布到已获授权的任务/PR 并核验永久链接，未核验标记 NOT_PERSISTED；收到回复不等于问题解决或产生批准。缺少 Linear/Feature ID 时明确 N/A 及真实替代任务来源，不凭空补造。不得保存密钥、私有推理或完整会话。

## 分派、执行与恢复

按[Task Contract](../contracts/task-contract.md)与[审批策略](../governance/approval-policy.md)确认目标、范围、输入、预期成果、角色/动作、环境与停止条件。有效批准范围内优先真实运行时分派和接续，不逐次向 Owner 重复申请；重大设计、业务编码、合并、发布、生产和破坏性操作仍各自授权。

遵循[Dispatch 契约](../contracts/agent-dispatch.md)：启动前持久分派 → 工具真实 execution/task ID 与回执 → 执行方 Handoff → Master 实时依赖协调。记录实际 Skill@SHA、产物源 SHA、时间与模式；先检查已有执行状态再重试。ROLE_SIMULATION / HUMAN_RELAY / RUNTIME_DISPATCH 不混淆，不自拟运行 ID；消息持久化不代表自动唤醒。

交接前读取[Agent Handoff](../contracts/agent-handoff.md)，恢复/会话切换读取[Context Checkpoint](../contracts/context-checkpoint.md)。只保存目标、最新来源与版本、关键决定、开放问题、执行 ID 和交接引用；接收方核验实时授权、HEAD、规格、前序 Handoff 和待处理消息，再 ACK 或 NEEDS_REFINEMENT。缺少必要批准、版本漂移或冲突时停止受影响动作；无依赖且已批准的工作可继续。

## 来源、独立性与门禁

- Shared Task Context 是最小源索引，不是第二套规格。仅增量核对受影响内容，状态和证据可由工具采集，不能自动推断“批准”或“实测成功”。
- 专家不独立批准自己；fresh-context Reviewer 读取原始需求、精确 diff 和证据，不导入 Coder 私有推理或自审结论。
- Master 负责充分性、跨角色一致性、取舍整合和 [Design Gate](../contracts/design-gate.md)；独立 Reviewer 保留独立判断，Owner 保留重大决定、风险接受和验收权限。
- CI、设计就绪、专业质量、Owner 批准、真实执行与生产部署分开报告；只读校验器 PASS 不能替代任何真实证据。

主成果入口可用[阶段交付模板](../templates/stage-delivery.md)，只引用一份审计附录，不为每个角色重抄协议全文。完整真实试点才读取[编排验证手册](master-orchestration-validation.md)；普通增量任务不重复执行完整试点。
