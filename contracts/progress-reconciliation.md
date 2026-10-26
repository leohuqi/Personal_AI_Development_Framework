# Master 进度协调与同步回执

Schema：`padf.progress-reconciliation/v1`；回执：`padf.progress-sync-receipt/v1`。Master在真实启动、阶段收件/ACK、Review/Gate或依赖变化等有意义节点，把事实同步到准确Linear执行任务。详见[有界设计](../docs/enhancements/progress-reconciliation/DESIGN.md)；不新增状态Agent、服务、数据库或自动通知。

## 身份与兼容

新执行合同设置`progress_reconciliation_required:true`，Dispatch携带`progress_identity`，Handoff/ACK绑定同一执行身份：

```js
identity = {
  tracker: 'linear', context_id, execution_context_id, repository,
  task_contract_ref, binding_ref, parent_cr_id: null, execution_issue_id
}
```

- `parent_cr_id`只是父CR/Feature容器；有独立Work Package时，`execution_issue_id`必须是准确子Issue，不能从父ID推导或回写父CR代替。普通Linear任务无父CR时用null，执行Issue仍必填。
- `context_id`保留既有任务/Feature上下文，`execution_context_id`指本工作包；Handoff、Master ACK与工具快照须一致。`handoff_id`定位专业交接；`source_head_sha`及`evidence_ref`定位不可变代码/设计/测试来源，PR链接另存。
- 无Linear任务必须显式`tracker:'none'`、父/执行Issue均null，并保留真实任务引用；结果为`NO_CHANGE_REQUIRED/NOT_APPLICABLE`，不调用Linear。
- 旧v0.3.4/v1 Contract和历史Handoff仍按旧规则读取，不追溯改写。新同步身份不全时BLOCKED；在原记录追加准确绑定和原Handoff引用后再启用，不能靠父任务或省略字段伪装旧格式。没有采用扩展且没有任何新progress身份的历史编排输入保持兼容。

## 顺序与状态

**Dispatch → Execution → Handoff → Master ACK → Progress Reconciliation → Verified State**。Master实际读件后，定位执行Issue，读当前状态/依赖和Team状态表，计划必要增量，更新，再回读Issue并保存/回读Receipt。下一阶段依赖和本阶段真实进展分别记录；失败的进度协调不能被ACK/CONTINUE覆盖。

前序收件后，Master还须逐个检查受影响下游执行Issue，以各自准确identity和有效范围授权分别执行读Issue/依赖→必要delta→回读→Receipt。现有单Issue helper可直接复用；只更新当前Issue或父CR摘要不代表下游依赖已同步，不新增跨Issue批量事务或工作流引擎。

| 实际事实 | 已有Linear状态 | Receipt细分状态 |
| --- | --- | --- |
| 尚未开始且启动前置不满足 | Backlog | WAITING_DEPENDENCIES |
| 启动条件具备 | Todo | READY |
| 真实Agent开始设计/编码 | In Progress | DESIGN_IN_PROGRESS / CODING_IN_PROGRESS |
| 实现已提交或QA/Review/集成进行中 | In Review | IMPLEMENTATION_READY / REVIEW_IN_PROGRESS |
| APPROVE WITH CONDITIONS | In Review | REVIEWED_WITH_CONDITIONS（完整保留条件） |
| 审查通过，等待Owner验收 | In Review | OWNER_ACCEPTANCE_PENDING |
| REQUEST CHANGES且真实返工已开始 | In Progress | DESIGN_REWORK / CODING_REWORK |
| 精确Owner验收及原G-01 MARK_ISSUE_DONE通过 | Done | DONE |

使用实际Team读取的状态ID/name/type；缺少、重复或不匹配时BLOCKED，不创建内部细分状态对应的Linear Workflow Status。In Review不代表Owner验收，Draft PR不代表未启动，CI/Review/merge不推导Done。Canceled/Duplicate或冲突终态交Master核对，不自动复活。

迟到事件按同执行上下文的真实`event.occurred_at/event_id`与明确前次Receipt核对。普通旧启动/Handoff不能回退较新进度；仅有真实新返工开始证据才可回In Progress。缺可核对顺序时BLOCKED，不用本次观察时间替代事件时间。

## 模块与调用

`lib/progress-reconciliation.mjs`导出纯`planProgressReconciliation(input)`和一次有界`reconcileProgress(input, adapter)`，并重导出既有orchestration模块的纯`validateProgressSyncReceipt(receipt)`。没有默认Linear网络客户端或凭据。可运行输入/注入式Mock见[受控fixture](../tests/v0.3/progress-fixture.mjs)。

`input`包含：schema、identity、`event:{event_id,type,occurred_at,work_kind}`、不可变`evidence:{source_head_sha,evidence_ref,implementation_ready?,pr_ref?,pr_draft?,review?}`、阶段节点的handoff/master_ack、当前有限写入`authorization:{status:'APPROVED',identity,evidence_ref}`、当前issue、实际statuses、显式dependencies和真实now。前次收据只能由显式`previous_receipt_ref`读取；没有隐含全库搜索或本地缓存成功。

- 事件type：READY、EXECUTION_STARTED、HANDOFF_ACKNOWLEDGED、REVIEW_COMPLETED、REWORK_STARTED、DEPENDENCIES_CHANGED、DONE_REQUESTED。实际开始还须`evidence.execution:{execution_id,started_at,evidence_ref}`。
- Handoff：handoff_id/ref、execution_issue_id、execution_context_id、source_head_sha、evidence_ref、submitted_at；ACK：相同handoff/执行身份、ack_ref、observed_at。交接时间≤ACK时间≤事件时间≤now。
- issue：id（准确identifier）、uuid、team_id、parent_id、state_id、blocked_by、updated_at、evidence_ref、observed_at。Adapter负责归一UUID/identifier，快照观察窗口最多5分钟。
- dependencies：`[{issue_id,phase:'start'|'integration',satisfied,evidence_ref}]`。只增删当前已核验的blockedBy关系，未知关系保持。parent不自动成为依赖，未合并PR不是启动阻塞的充分依据；已执行工作不因下一集成阶段未就绪退Backlog。

注入工具最小接口：

```text
readIssue(execution_issue_id) -> issue
readStatuses(team_id) -> [{id,name,type}]
updateIssue(execution_issue_id, {state_id?,add_blocked_by,remove_blocked_by},
            {expected_updated_at,operation_key}) -> {success,evidence_ref,...}
persistReceipt(core) -> {receipt_ref}
readReceipt(receipt_ref) -> core
```

可选`adapter.now()`仅用于获取执行前实时时钟（测试可固定时钟）；默认使用当前系统时间。仅必要状态与显式关系delta传给updateIssue，不改parent、描述、负责人或替换全部关系。实际工具若分次执行须保留逐项回执，任何部分失败都不能返回聚合success。

执行器先读Issue/Team，再在写前重读，检测updated_at及状态/关系的语义漂移；写后核对准确Issue、状态、依赖和无意外关系变化。当前Linear工具没有原子CAS，`expected_updated_at`是适配器前读约束，不是服务器CAS承诺。回执固定标记`READ_BACK_OBSERVED_NOT_ATOMIC`；跨会话读取与写入间仍有竞态，高风险操作无法接受此边界时先BLOCKED。不会通过全局配置、锁服务或无限重试掩盖限制。

## 结果、Receipt与重试

| 结果 | 可声明事实 |
| --- | --- |
| SYNCED | 必要写入真实成功、Issue回读一致、Receipt保存与内容回读一致 |
| NO_CHANGE_REQUIRED | 已核验状态/关系正确且零写入；或明确GitHub-only N/A |
| BLOCKED | 身份、授权、证据、阶段顺序、写前冲突或Done门禁阻止执行 |
| PROGRESS_SYNC_FAILED | 读取/写入/回读/持久化失败、结果未知或写后不一致 |

Receipt包含identity、稳定operation_key与本attempt身份、事件/细分状态、Handoff/ACK/授权、证据SHA/PR/Review与全部条件、原Issue/目标状态、带依据的依赖delta、实际write_results及readback、同步时间、result/reasons、failure_items和验证边界。Receipt核心先保存并回读逐字段比较，再把真实receipt_ref和核心hash附到返回结果；这避免正文自引用。纯validator只校验相容性，不能认证现实身份、网络工具或Owner。

同一Handoff重复接收仍读取当前状态；已正确则零重复写入。一次调用只做一次状态/关系更新，没有自动重试或再次启动Agent；同进程同Issue的重叠尝试BLOCKED，跨会话不宣称exactly-once。网络结果不确定先回读，之后Master以同一逻辑事件有界重试同步。保存失败仍为PROGRESS_SYNC_FAILED；保留已经完成的Handoff/ACK和实际部分回执，不宣称整体Reconciliation完成。

## 既有门禁与接入

`evaluateOrchestrationChain`在新链级要求或任一新progress_identity出现时，强制所有阶段显式适用性。Linear阶段必须有准确身份/Handoff/ACK/源SHA绑定且已持久化回读的成功Receipt，缺失、失败、错绑及链末尾遗漏都不eligible。`evaluateDesignGate`传入该要求，不能被旧orchestration开关关闭。原有未采用扩展的记录不受新增必填约束。

Done额外要求完整`done_input`：subject、authorization.subject与acceptance必须同时绑定当前execution_issue_id/execution_context_id、原context/Task Contract/仓库/源码SHA；父级、兄弟任务或无执行绑定的旧验收先BLOCKED。随后直接调用原`evaluateActionPreflight(MARK_ISSUE_DONE)`并在执行前用新时钟`revalidateActionPreflight`；只有两者READY才允许Done。不会接受调用方字符串READY，原action-preflight实现保持不变。

PQA/PKMS采用时，在已有任务附加准确绑定，核对现有Team状态并在受控环境试验，再单独批准项目接入。此框架PR不写真实项目状态、不改业务、不自动升级正在进行的CR。历史失步回归使用Owner提供事实，当前只读观察不能冒充本修复效果。
