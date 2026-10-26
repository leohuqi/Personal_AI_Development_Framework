# Agent Dispatch 与执行证据 — PADF V0.3

Schema：`padf.agent-dispatch/v1`。验证 Master 是否真实完成 `Dispatch → Execution → Handoff → Dependency Reconciliation`。沿用 [Task Contract](task-contract.md)、[Agent Message](agent-message.md)、[Handoff](agent-handoff.md)、[Checkpoint](context-checkpoint.md) 和[阶段依赖](agent-dependency.md)。本契约保存证据，不创建运行时、调度器或自动唤醒服务。

## 授权与启动

已批准范围内的 Master 分派与启动复用有效 Owner 批准，不要求每次重新批准；优先调用可用真实 Agent 运行时。重大设计决策、业务编码、合并、发布、生产部署、破坏性操作和最终验收不在这项持续分派授权中，遵循[审批策略](../governance/approval-policy.md)。

启动前从权威来源重读授权、版本及依赖，形成以下只读快照；不得由待执行 Agent 自行填造批准。`evaluateDispatchAuthorization({authorization, dispatch, decision_approvals})` 只校验快照相容性，返回 CONTINUE/BLOCKED；CONTINUE 不证明来源真实、权限有效、依赖就绪或已经执行。它与 `evaluateOrchestrationChain` 的执行证据检查相互独立，两个 PASS 仍不替代实时核验。

```yaml
authorization:
  schema_version: padf.dispatch-authorization/v1
  authorization_ref: https://github.com/owner/repo/issues/1#approved-contract
  owner_approval_ref: https://github.com/owner/repo/issues/1#owner-approval
  status: APPROVED
  context_id: project-task
  repository: owner/repo
  task_contract_ref: https://github.com/owner/repo/issues/1#approved-contract
  environment: isolated
  scope_items:
    - id: review-design
      allowed_roles: [independent-reviewer]
      allowed_actions: [REVIEW]
      required_decisions: []
dispatch:
  context_id: project-task
  repository: owner/repo
  task_contract_ref: https://github.com/owner/repo/issues/1#approved-contract
  environment: isolated
  target_role: independent-reviewer
  action: REVIEW
  scope_ids: [review-design]
decision_approvals: []
```

- 可分派角色包括 solution-architect、module-architect、ui-ux-designer、feature-coder、qa-tester、independent-reviewer、context-coordinator 和 product-analyst；允许角色仍须在各范围项中明确绑定，角色名不自带执行权限。
- 同一批准快照可用于多个有独立 `dispatch_id` 的启动；无需新增 dispatch 级 `owner_approval_ref`。仍须逐次核验实时状态。完成、取消、撤销、过期或缺少授权时阻断。
- `scope_items` 是已批准 Task Contract 的有限范围清单；每项绑定允许角色、动作及 `required_decisions`（无前置决策显式写 `[]`）。不可用自由文本或通配符推断扩大授权，接收方不得自行删减前置条件。
- 本校验器仅允许 `ANALYZE / DESIGN_PROPOSAL / DESIGN / TEST / REVIEW / COORDINATE`；未知动作、业务编码、决策批准、合并、发布、部署、破坏性操作和最终验收均不能通过，即使被误写入范围。另行批准的编码走既有编码 Task Contract 与 Design Gate 路径，不由此校验器授予。
- 必要决策写为 `{decision_id, kind, subject_ref}`；`subject_ref` 必须固定到 `path@<40位SHA>`。`decision_approvals` 中须有相同三项、`status: APPROVED` 和可核验的 `owner_approval_ref`；PROPOSED、错误版本、重复或缺失决策均阻断。
- 正式 Module `DESIGN` 的每个范围项须包含 `kind: SYSTEM_BASELINE`；正式 UI `DESIGN` 须包含 `UI_PROFILE` 或 `UI_PROFILE_CREATION` 前置条件。Owner 已明确授权的提案起草用 `DESIGN_PROPOSAL`，不能标记正式完成或放行 Gate。创建 Profile 的批准不能替代后续重大视觉决策批准。
- 范围、仓库、上下文、环境或 Task Contract 不匹配时阻断对应启动。重试先查询已有执行，避免并发重复；有效批准不会因单次工具失败而自动失效，也不会因此扩大。

## 同一 Agent 的接续

按[共用接续规则](../workflow/agent-protocol.md#优先接续已有-agent)先查询并复用合适的实际会话。接续是当前有界分派的执行方式，仍逐次核对授权与依赖；不要求为每次启动新增Owner批准。

会话/运行时任务引用可保持原值；新分派的 dispatch_id、当前输入/Skill版本、实际执行回执、时间及Handoff关联仍须准确。复用 executor_session_ref / runtime_task_ref 不等于复用旧阶段的执行事实；正式设计链仍检查当前阶段的唯一绑定和真实先行，运行时缺证据不能补造。需要新会话时在已有记录写原因与恢复来源，不改变schema或增加必填表。

## 执行模式

| execution_mode | 启动方与证据 | 可声明的事实 |
| --- | --- | --- |
| ROLE_SIMULATION | 同一会话扮演多个角色 | 仅协议演练，不能通过真实编排验收 |
| HUMAN_RELAY | Master 发分派，Owner 用链接启动独立会话；真实会话证据或明确 Owner 证明 | Master 协调的跨会话执行 |
| RUNTIME_DISPATCH | Master 调用真实工具并收到运行时 task/run ID | 外部运行证据核验后可声明 Master 启动 |

不得自动转换或混淆模式。打印 TASK_REQUEST、自拟 ID 或角色标签不证明独立进程。可用安全的不透明会话标识；不发布密钥或私有对话。无法验证会话标识时标记 OWNER_ATTESTED 并说明局限，不伪造客观证明。

## 每个阶段的不可变证据链

1. **DISPATCH（启动前）**：持久化 `dispatch_id`、`context_id`、目标角色、批准的 Task Contract / Feature ID、Skill@SHA、输入规格与系统基线、`depends_on_dispatch_ids`、预期产物、范围与停止条件、既有授权引用、实际模式、启动方和 `dispatch_ref` 永久链接。记录 Master 理由、创建时间与分派前核验结果。分派请求不等于执行。
2. **EXECUTION（接收方）**：读取分派及当前依赖，记录 `execution_id`、`executor_role`、`executor_session_ref` 或真实运行时任务 ID、`started_at`、`dispatch_ref_read`、`skill_ref_used`、`initiated_by` 与证据类型 RUNTIME_ISSUED / SESSION_VERIFIED / OWNER_ATTESTED / SELF_REPORTED / NONE。自述不等于已独立核验。
3. **HANDOFF（执行方）**：持久化 `handoff_id/ref`、dispatch/execution ID、发送/接收方、固定到源 SHA 的产物、测试/渲染/原型 PASS/FAIL/BLOCKED/NOT_RUN、未决事项及 ACK/NEEDS_REFINEMENT。未核验永久链接时标记 NOT_PERSISTED。
4. **DEPENDENCY RECONCILIATION（Master）**：重读实时任务、授权、前序产物 SHA、源与 Skill 版本、阻塞消息和审查义务，记录 `reconciliation_ref`、`master_run_ref`、CONTINUE/BLOCKED/NEEDS_REFINEMENT、理由、观察时间及下一 `next_dispatch_id`。新依赖分派须引用前序 Handoff 与协调结论，时间必须在其后。

Handoff 不等于批准。both 模式允许评审 PROPOSED SYSTEM 草稿，正式 MODULE 必须匹配 Owner 已批准的 SYSTEM 版本。L/XL 必须有最新独立 DESIGN Review；编码授权仍独立。

同一链包含 SA 时，Module 按 `system_baseline_ref` 在整条链的 SA Handoff 中寻找唯一的精确 `solution-architecture` 来源，该来源须先于 Module 执行，并在 `depends_on_dispatch_ids` 中被直接依赖。不得任取第一位 SA，也不能将稍后才完成的系统设计视为链外已有基线；来源缺失、重复、晚于 Module 或未建立实际来源依赖时阻断。纯 module 链可复用链外已批准基线，正式 Gate 另核对 Dispatch 与当前任务所用基线、批准引用及 UI Profile，不能用旧输入执行产生的声明替代当前输入。

用链证明正式设计完成时，所有必需专业阶段间已有的阶段依赖，都须在实际绑定 Dispatch 的先后顺序和直接/传递依赖上成立。不能把产品定义或其他前序专业工作放到实际执行最后，再凭最终 COMPLETED 标签补认。合法的运行时传递依赖无需重复直接列出全部先祖；both 的精确 SYSTEM 来源直接依赖另按上一段核对。

## 成果与记录的比例

分派先说明问题、预期主成果与内容标准，不以完成审计字段作为交付目标。共用[工作方法](../workflow/role-work-method.md)与[协议](../workflow/agent-protocol.md)按需加载；最小真实执行证据仍保留在附录。同一有效授权内的研究、返工、接续不逐次新增批准；重大决定与未授权业务编码等仍阻断。

## 证据有效性与角色交付

当链作为 Design Gate 的正式编排证据时，还须遵循[当前任务/阶段绑定](design-gate.md#正式编排与当前设计绑定)：链顶层的 context_id/repository/task_contract_ref 绑定 Gate；各 Dispatch.repository 同一仓库，各必需设计阶段以 orchestration_binding 定位唯一 dispatch/execution 和精确任务契约；对应 Handoff 覆盖全部必需产物@SHA。链内部自洽不代表它属于当前任务。独立使用 evaluateOrchestrationChain 的既有结构检查不签发这些跨输入事实。

- Master 与执行会话须不同并有独立佐证；相同 GitHub 登录不证明会话相同或独立。HUMAN_RELAY 记录人工启动证据，RUNTIME_DISPATCH 记录工具返回任务 ID 及完成证据。
- 四阶段 ID、角色、上下文、Skill/产物版本和时间顺序必须一致；过期 SHA、缺少批准时标记 STALE/BLOCKED，不回写历史 PASS。
- 合成 fixture 的 URL/ID 只测试元数据，不能证明真实运行、Owner 批准、设计质量或外部工具执行。[只读检查器](../lib/orchestration-evidence.mjs)不能访问或认证运行时。
- Solution Architect：新应用/平台约束与基线选择任务 → 具体技术栈、ADR、系统架构、应用级模块/代码结构及真实图表。
- Module Architect：已批准精确 `system_baseline_ref`、目标模块及 SYSTEM Handoff → 包/类/端口/契约、模块图及错误/重试/数据/测试边界。
- UI Designer：已批准 Profile 或创建授权、目标界面与 L1/L2/L3 → 设计理念、概念/UI 规格、高保真源、所选交互原型及 Profile 符合性证据。

参见[真实验证手册](../workflow/master-orchestration-validation.md)与[质量评价](skill-delivery-evaluation.md)。
