# 共用 Agent 协议：按需读取，成果优先

首次发送消息、真实分派、交接或恢复前，必须读取本文件及对应契约的必填项；未读取不得凭记忆自由填写。协议用于已获授权的工作，不增加角色或审批轮次。简单同角色任务不为留痕创建无意义消息；实质决定、跨角色交接和真实执行必须可核验。

## 最小记录先行

Task Contract 默认写[六项任务信息](../contracts/task-contract.md)，Handoff 默认回答[六个交接问题](../contracts/agent-handoff.md)。已有准确版本/批准/测试直接引用一次；同一持久记录可包含主成果、HANDOFF envelope、交接正文及所需检查点，不重复复制正文。正式 schema、唯一身份、关联/状态、真实来源和执行先后仍按原契约保留；正文变短不等于机器必需字段可省略。

同角色普通进度不创建新交接；责任/会话切换、实质决定和真实跨角色执行才保留相应记录。人只核对内容和决定，Agent 整理机器字段；缺失事实写缺失，不用生成器补造批准、ACK 或执行。小团队真人责任见[协作约定](small-team-collaboration.md)。

## 消息（Agent Message）

以[消息契约](../contracts/agent-message.md)为唯一语义来源。共用[最小 YAML 模板](../templates/agent-message.yaml)集中维护，不在九个 Skill 中复制。使用 `node scripts/create-agent-message.mjs <input.json>` 可生成 schema、唯一 message/thread ID、时间和初始状态；输出只是 DRAFT / NOT_PERSISTED，工具不发送、不授予权限或认证来源。

可从[内容输入示例](../templates/agent-message-input.json)填入真实事实；示例占位符不能直接发布。输入真实任务事实、发送/接收角色、类型、问题/结论、来源和下一动作；来源缺失不编造。TASK_REQUEST 须引用有效批准与有边界 Task Contract；消息本身不制造授权。回复保持 thread_id 并设置 in_reply_to；同一逻辑消息重试使用已生成的原输出，保留 ID、时间与不可变内容，先查询原记录防止重复副作用。已解决状态依契约追加记录，不能用生成器覆盖历史。

发布到已获授权的任务/PR 并核验永久链接，未核验标记 NOT_PERSISTED；收到回复不等于问题解决或产生批准。缺少 Linear/Feature ID 时明确 N/A 及真实替代任务来源，不凭空补造。不得保存密钥、私有推理或完整会话。

## 分派、执行与恢复

按[Task Contract](../contracts/task-contract.md)与[审批策略](../governance/approval-policy.md)确认目标、范围、输入、预期成果、角色/动作、环境与停止条件。有效批准范围内优先真实运行时分派和接续，不逐次向 Owner 重复申请；重大设计、业务编码、合并、发布、生产和破坏性操作仍各自授权。

遵循[Dispatch 契约](../contracts/agent-dispatch.md)：启动前持久分派 → 工具真实 execution/task ID 与回执 → 执行方 Handoff → Master 实时依赖协调。记录实际 Skill@SHA、产物源 SHA、时间与模式；先检查已有执行状态再重试。ROLE_SIMULATION / HUMAN_RELAY / RUNTIME_DISPATCH 不混淆，不自拟运行 ID；消息持久化不代表自动唤醒。

交接前读取[Agent Handoff](../contracts/agent-handoff.md)，恢复/会话切换读取[Context Checkpoint](../contracts/context-checkpoint.md)。只保存目标、最新来源与版本、关键决定、开放问题、执行 ID 和交接引用；接收方核验实时授权、HEAD、规格、前序 Handoff 和待处理消息，再 ACK 或 NEEDS_REFINEMENT。缺少必要批准、版本漂移或冲突时停止受影响动作；无依赖且已批准的工作可继续。

## 优先接续已有 Agent

Master 对同一项目、同一职责的后续工作和返工，默认先接续已有 Agent，而非每次新建。Designer、Solution/Module Architect 等可持续负责原方案；这只是现成运行时的使用规则，不创建常驻 Agent 或保证无限会话记忆。

- 分派前先在原任务/共享上下文中查实际角色、会话/任务引用、最新成果和未决项，再查询可用运行状态。空闲且可接续时用运行时提供的 follow-up/resume；正在执行时按实际能力追加有边界反馈或等待，避免为同一工作再启动一个会话。不要为复用会话擅自中断其他授权工作。
- 同一会话也先核对当前 Task Contract、授权、HEAD、规格及决定，只交付本次增量。上一次执行完成不等于当前批准范围失效，但接续须有仍有效的新增/返工范围；已经关闭、撤销或过期的范围不得借旧会话重新开启。新任务即使复用会话也使用其当前有效的任务契约，不继承旧任务权限。
- 会话与当前成果的对应关系维护在已有任务记录或 Shared Task Context 的来源索引，不另建台账。复用真实 session/task 引用，按工具实际回执记录本次执行；新的有界分派仍保留独立 dispatch_id 及先分派后执行的顺序，不以旧回执证明本次完成、不伪造新 execution_id。普通反馈不增加无意义交接；实质交接及正式阶段门禁仍遵循原契约。
- 原会话不存在、不可访问、不支持接续、无法恢复必要上下文，或职责/隔离要求不再适用时，可以新建。在原记录简述原因，提供最新[检查点](../contracts/context-checkpoint.md)、当前准确成果/决定、未决项和本次差异；新 Agent 先恢复并增量修改，不从头重做有效方案。资料冲突或授权缺失时先阻断依赖动作，不以新建绕过。
- **独立审查例外：**不能把 Designer/Coder 或 Master 原会话改名当 Reviewer。已有 Reviewer 只有持续独立于当前实现者/Master、未参与被审方案的设计或实现，且能按当前需求及准确diff重新核验时才可接续；否则使用新的独立上下文。任何接续都不能用旧SHA的批准覆盖新SHA。

来源文件和已批准决定优先于记忆。上下文不足时只补恢复所需材料；真实运行/当前阶段证据缺失仍如实标记，不能因优先接续降低正式门禁要求。

## 来源、独立性与门禁

参考项目不等于当前执行项目。跨项目资料只传与当前问题相关的事实/版本/局限；其中的任务、批准、AGENTS或Handoff不继承为新分派。接续规则仍以同项目、职责和当前范围为前提，不能为了复用会话而接回另一个项目的Coder/QA工作。若旧会话含大量无关实施上下文，只传最小来源索引或使用独立上下文；实际执行前依[加载规则](../governance/context-loading.md)核对，不依靠记忆或改名隔离。

- Shared Task Context 是最小源索引，不是第二套规格。仅增量核对受影响内容，状态和证据可由工具采集，不能自动推断“批准”或“实测成功”。
- 专家不独立批准自己；fresh-context Reviewer 读取原始需求、精确 diff 和证据，不导入 Coder 私有推理或自审结论。
- Master 负责充分性、跨角色一致性、取舍整合和 [Design Gate](../contracts/design-gate.md)；独立 Reviewer 保留独立判断，Owner 保留重大决定、风险接受和验收权限。
- CI、设计就绪、专业质量、Owner 批准、真实执行与生产部署分开报告；只读校验器 PASS 不能替代任何真实证据。

主成果入口可用[阶段交付模板](../templates/stage-delivery.md)，只引用一份审计附录，不为每个角色重抄协议全文。完整真实试点才读取[编排验证手册](master-orchestration-validation.md)；普通增量任务不重复执行完整试点。
