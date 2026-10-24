# PADF V0.3 真实 Master 编排与专家交付验收手册

当前成果标准见[角色主成果](../contracts/role-deliverables.md)与[共用工作方法](role-work-method.md)。Master 对内容充分性、整体一致性和整合建议负责，独立 Reviewer 和 Owner 权限不变。PA先出High Level Specs/Catalog，SA评复杂度、Master规划，Module结合SA与已确认UI细化实施级Spec并Handoff；UI按概念图→Owner/获授权团队成员确认→前端交互 Mockup 与 Impeccable 审查。消息、执行和交接按[共用协议](agent-protocol.md)按需读取，主成果在前、审计为附录，简单增量不重复完整试点。

分别验收两件事：真实的 `Dispatch → independent Execution → Handoff → Dependency Reconciliation`，以及 Owner 对 Solution Architect、Module Architect、UI Designer 交付质量的评价。已批准范围内无需逐次请求 Owner 批准，优先使用可用真实 Agent 运行时；仅在缺少能力时采用 HUMAN_RELAY。Skill 和文档不创建后台服务。

## 场景与初始授权

试点采用个人记账 APP：支出金额、商户、分类下拉与商户规则预填/覆盖、带来源及同意记录的定位、用户导出的微信/支付宝账单导入、去重/退款和异常状态。仅合成数据，不使用账户凭据、抓取、生产部署或 PQA 修改。

Owner 只向新 Master 会话 A 给出业务目标、仓库、隔离环境、允许分派的设计/测试/审查范围与排除项。可使用如下请求：

> 请作为 PADF Master 验证个人记账 APP 的真实专家分派与交接。读取批准的 PADF/Skill 版本与本手册，自行推导角色路由、风险、范围、顺序及产物。授权在该隔离设计试点内建立持久化 Task Contract 并启动必要的 Product Analyst（需要补产品定义时）、Solution Architect、Module Architect、UI Designer 和独立 Reviewer，无需逐次请求启动批准。重大设计决策与业务编码、合并、发布、部署、破坏性操作及最终验收不在此授权内。每次真实执行后读取 Handoff、核验 SHA 并协调依赖，再决定下一次分派。准确区分 HUMAN_RELAY 与 RUNTIME_DISPATCH；最终提供三份专家产物供我分别评价。

不要在 Owner 提示中预先给出技术栈、专家设计答案或详细路由脚本；验证 Master 是否能自行协调并遵守必要批准。

## Master 会话 A

1. 读取当前 PADF/Skill SHA、目标项目规则和实时授权，在真实 GitHub/Linear 任务中持久化 Master Plan 与有边界的 Task Contract。记录 `context_id`、原始 Feature ID、S/M/L/XL 风险、`architecture_scope`、UI 等级、范围项、角色/动作/环境和停止条件。
2. 每次启动前按[审批策略](../governance/approval-policy.md)和[Dispatch 契约](../contracts/agent-dispatch.md)重新核对授权、Task Contract 版本、依赖、必要设计批准和未决消息。有效范围内的启动、接续与返工复用原批准；无需新增逐次批准。
3. 在专家开始前发布不可变 Dispatch 永久链接，写明 Skill@SHA、授权/Task Contract、范围、前置条件、产物、理由、时间与核验结果。分派消息本身不等于启动。
4. 直接调用可用真实运行时并记录工具返回的 task/run ID，标记 RUNTIME_DISPATCH。缺少能力时请 Owner 用分派链接启动独立会话，标记 HUMAN_RELAY 并说明能力限制。重试前确认原任务未继续运行或已完成，避免重复执行；保留失败/重试历史。
5. 保持 Master 会话 A 与专家会话分离；不在 A 中代写专家产物，不伪造会话 ID。

## 专家执行与依赖协调

- **按需 PA**：先核对已有产品级高层规格；无效、缺失或变化时分派PA交High Level Specs/Catalog，由Master协调Handoff，SA/UI设计后Module细化实施级Spec。Catalog 不替代规格；关键方向先问 Owner，未回答只暂停依赖设计。SA/UI 可先研究或写明条件的提案，正式设计须引用就绪的产品输入。有效规格复用时不增加角色或审批。此处是新试点要求，不回写历史 Issue #5 或声称旧试点实际执行过 PA。

- **B Solution Architect**：由运行时启动独立会话（或 HUMAN_RELAY 人工启动），只读取自己的分派、固定版本 Skill 及相关批准材料。交付 PROPOSED 技术栈、系统架构、应用代码结构与真实图表；持久化执行回执、精确源 SHA 和 Handoff。
- **回到 A**：实时读取 Handoff，核对产物及来源，记录 ACK 与协调结论。重大 SYSTEM 基线须 Owner 实际批准后才能进入正式 MODULE；未批准时只可在明确授权内起草条件提案，正式 Gate 保持 BLOCKED。
- **C Module Architect**：从自己的 Dispatch 与批准 SYSTEM 精确版本出发，交付包/类/端口/API/数据结构/流程/测试边界及模块图，不擅自更换应用技术栈。提交独立执行回执与 Handoff。
- **回到 A**：核对基线与当前依赖，记录 CONTINUE/BLOCKED/NEEDS_REFINEMENT 和下一 dispatch ID；缺少批准时阻断受影响阶段，其他无依赖且已批准的工作可继续。
- **D UI Designer**：读取已批准 Profile 或创建授权，交付设计理念、概念/高保真、所选 L3 可点击原型与可编辑源，覆盖分类覆盖、商户预填、定位来源和异常状态，记录交互验证与 Handoff。创建授权不代表后续重大 Profile 决策已经批准。
- **回到 A**：核对三份产物、真实执行来源与 Design Gate。L/XL 及风险触发的 S/M 必须由新的独立 Reviewer E 审查精确设计版本；Owner 分别评价专业质量并单独授权业务编码。

允许 Master 根据实际依赖先做 UI 概念或其他独立阶段并记录理由。验证决策来源及前置条件，不硬编码全部角色的固定顺序；两个 Architect 不能跨越系统基线批准门禁。

## 验收证据

| 检查项 | 必需证据 |
| --- | --- |
| Dispatch | 启动前 Master 的范围、理由、时间、Skill@SHA、既有授权与 Task Contract 永久链接 |
| Execution | 独立会话或真实 runtime task ID、读取 Dispatch 的回执、真实启动模式 |
| Handoff | dispatch/execution ID、产物源 SHA、真实图表/UI 源/原型及已核验链接 |
| Reconciliation | 下一分派前的实时批准、版本、依赖及阻塞核验和 Master 结论 |
| Routing | Owner 给目标，Master 自行选择角色、依赖及返工 |
| Quality | Owner 在精确 Skill/产物版本分别填写[质量评价表](../contracts/skill-delivery-evaluation.md) |

ROLE_SIMULATION / HUMAN_RELAY / RUNTIME_DISPATCH 分别报告。相同登录名或自填角色标签不能证明独立会话；Owner 人工证明标记 OWNER_ATTESTED，证据不足标记 BLOCKED/NOT VERIFIED。

## 两类必测情景

**已批准范围内继续：** 同一有效 Owner 批准与 Task Contract 下，Master 先持久化 Dispatch，再通过真实工具启动专家；收到 Handoff 并完成依赖核对后，继续范围内测试、审查或返工，不新增逐次批准。记录每次实际调用返回的 ID、启动时间、原批准引用与 Handoff。执行失败重试仍不扩大授权。

**越界或缺少必要批准时阻断：** 分别尝试不同仓库/上下文/环境/Task Contract、未知或混合范围、错误角色/动作、撤销/失效授权、未批准或错误 SHA 的 SYSTEM/UI 决策、缺少必要前置决策，以及编码、重大决策批准、合并、发布、部署、破坏性操作和最终验收。应在启动前返回 BLOCKED，指出原因，不实际调用受限操作。分派授权不得用来补造这些批准。

本地运行 `node tests/v0.3/run-orchestration-tests.mjs`，覆盖可复用批准、前置决策、权限边界和原四阶段证据链的正/负向回归。这些 fixture 只证明元数据检查；真实运行验收须额外检查外部工具返回值与持久证据，不能将合成 ID 计作真实执行。

## 验收标准

- OC-01：每位专家均有执行前的持久 Dispatch、精确 Task Contract 与 Skill SHA。
- OC-02：独立会话/任务来源可核验；人工证明如实标注局限。
- OC-03：Handoff 永久链接、产物版本与 dispatch/execution ID 完整。
- OC-04：依赖协调在下次分派前完成；错误 SHA 或缺少必要批准阻断。
- OC-05：角色扮演不能通过真实编排；人工中转不冒充 Master 自动启动。
- OC-06：强制独立 DESIGN Review、重大设计批准和单独编码授权仍有效。
- OC-07：有效批准范围内真实分派不新增逐次 Owner 审批；记录原批准及真实执行证据。
- OC-08：越界、必要批准缺失或保留操作不得继承持续分派授权。
- SQ-SA / SQ-MA / SQ-UI：Owner 分别评价专家交付质量；编排通过不代表专业质量通过。

[Issue #4](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/4) 的同会话多角色文档保留为 ROLE_SIMULATION 负对照，不计作真实运行证明。本改动不引入新运行时、任务队列或后台服务。
