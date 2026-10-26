# Master 进度协调：有界模块设计

**建议增加一个 `lib/progress-reconciliation.mjs`，把已收到的执行事实同步到准确执行 Issue，再以回读结果决定是否完成协调。** 不增加角色或服务；Master 仍负责读件、授权判断和工具调用。Task Contract、Dispatch、Handoff 和现有 G-01 保持各自身份与权限。

本设计由真实 Module Architect `/root/progress_module_architect` 执行 `PROGRESS-MA-01`。任务/Owner授权：[Enhancement #27](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/27)；事前分派：[6414492571](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/27#issuecomment-6414492571)。`system_baseline_ref` 为已生效 [README@6469aba](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/6469aba08b4a3c31d4c8030aeeda26d93d493b2e/README.md)及同SHA的现有 `lib/action-preflight.mjs` / `lib/orchestration-evidence.mjs`；技术约束为现有 Node ESM、内置依赖、无数据库/后台运行时。Profile=Lite、scope=module、M/workflow+concurrency，需独立 DESIGN Review 后进入已授权编码。

## 缺口、职责与改动位置

当前 `evaluateOrchestrationChain` 只核对 Master 的 `reconciliation_ref`、决定与先后顺序；它不定位或读取 Linear Issue，也不验证状态更新。Task/Handoff 的任务/Linear引用可指父CR，不能保证对应实际Work Package。于是ACK及PR更新可以真实完成，执行子任务却没有状态同步证据。

| 位置 | 最小增量 |
| --- | --- |
| `contracts/task-contract.md`、`agent-dispatch.md`、`agent-handoff.md` | 链接统一进度契约；明确父CR/执行Issue/执行上下文/交接/不可变证据身份，保持现有v1 schema与旧记录可读 |
| `contracts/progress-reconciliation.md` | 唯一当前语义：输入、阶段映射、计划/执行/回读、Receipt、失败恢复与兼容；其他文档只给短引用 |
| `lib/progress-reconciliation.mjs` | 纯计划器、一次有界执行器与收据校验；注入工具，无Linear凭据/SDK/网络客户端，无自动Agent调度 |
| Master Skill、`workflow/agent-protocol.md`、`WORKFLOW.md`、`context-communication.md` | 有意义节点执行 `Dispatch → Execution → Handoff → Master ACK → Progress Reconciliation → Verified State`；失败保留ACK但不宣称协调完成 |
| 现有结构validator与CI、一个测试入口 | 加入新契约/模块/回归；不改原G-01或Design Gate判定 |

组件/工具调用关系见[组件图](progress-components.html)；完整规则以本设计与实施后的唯一契约为准。

## 身份、事实与兼容

新增信息维护在同一 Task Contract 或其精确引用中，Dispatch/Handoff引用同一绑定，不要求Owner重复填写。

```text
identity = {
  tracker: 'linear' | 'none',
  context_id, execution_context_id, repository, task_contract_ref,
  parent_cr_id: string | null,
  execution_issue_id: string | null,
  binding_ref
}
handoff = {handoff_id, handoff_ref, execution_context_id, execution_issue_id,
           source_head_sha, evidence_ref, submitted_at}
master_ack = {handoff_id, handoff_ref, execution_context_id, execution_issue_id,
              ack_ref, observed_at}
```

- `context_id` 保留现有稳定任务/Feature上下文；`execution_context_id` 指本执行工作包。父CR可汇总多个执行上下文；两者可以在普通任务中相同，但不做默认猜测。`execution_issue_id` 绑定实际Linear工作包，绝不从 `parent_cr_id` 或parent关系推导。若设置父CR，执行Issue必须不同。输入合同、Handoff、ACK、工具回读的执行身份必须一致；`binding_ref`来自已核验任务与增量绑定记录。
- 没有父CR的普通Linear任务：`parent_cr_id:null`，`execution_issue_id` 为本任务Issue。GitHub-only任务显式 `tracker:'none'`、执行Issue/父CR为null、真实任务引用有效，返回 `NO_CHANGE_REQUIRED` 与 `applicability:'NOT_APPLICABLE'`，不得调用Linear或捏造ID；本Enhancement #27正是此情况。
- 旧v0.3.4/v1 Contract/Handoff仍可读取，旧schema验证不因缺新增字段失败。启用新增同步时，Master须在现有记录追加准确绑定，明确引用原Handoff；只有已核验“原任务就是执行Issue、无独立子任务”时才可采用旧任务ID。身份不明返回 `BLOCKED/EXECUTION_ISSUE_ID_REQUIRED`；不能改写旧Handoff，不能让父CR代替子任务。
- 代码、设计或测试证据使用40位 `source_head_sha` 和不可变 `evidence_ref`（如GitHub blob/commit路径或固定SHA产物）；PR URL与Review结论另存。永久PR评论可定位Handoff/ACK，但不是不可变代码证据。真实运行时开始、阶段产物、Review等来源由Master核验，库只检查调用方投影的相容性，不认证身份/批准/URL内容。

## API、工具边界与状态

建议公开三个函数，无类/插件注册或长期状态：

```text
planProgressReconciliation(input) -> ProgressPlan
reconcileProgress(input, adapter) -> Promise<ProgressSyncReceipt>
validateProgressSyncReceipt(receipt) -> {valid, errors[]}
```

`input`包含：`schema_version:'padf.progress-reconciliation/v1'`、上述identity、`event`、handoff与master_ack（阶段交接节点）、已核验`evidence`、实际team状态表、当前Issue快照、显式依赖事实、当前有限写入授权、`now`与来源观察时间；存在前次协调时另传 `previous_receipt_ref`，由 `readReceipt` 读取其准确事件/来源/上下文。可读纯计划器便于Master先审查；执行器必须重新读取当前权威状态，不能把旧计划当令牌。未知事件、未知/重复/缺必要Team状态、错team/issue/context、畸形证据或越界授权均BLOCKED且零写入。GitHub-only适用性分支先核对其显式无Linear绑定，不要求不适用的Linear状态表或适配器。

事件为有意义节点：`READY`、真实`EXECUTION_STARTED`（设计/编码）、`HANDOFF_ACKNOWLEDGED`、`REVIEW_COMPLETED`、真实`REWORK_STARTED`、`DEPENDENCIES_CHANGED`和明确`DONE_REQUESTED`。不能因普通内部微步骤调用Linear。`HANDOFF_ACKNOWLEDGED`与`REVIEW_COMPLETED`须同时具有准确Handoff及Master ACK；真实开始须有实际工具execution/task回执与开始时间。请求返工但尚未启动，保留In Review或真实当前活动阶段，不写“返工已开始”。

| 依据已核验事实选择的工程阶段 | Team语义状态 | 保留细分状态 |
| --- | --- | --- |
| 未真实启动且当前启动前置不满足 | Backlog | WAITING_DEPENDENCIES |
| 未真实启动且启动条件满足 | Todo | READY |
| 真实设计/编码已开始 | In Progress | DESIGN_IN_PROGRESS / CODING_IN_PROGRESS |
| 实现已提交、QA/Review/集成/Owner验收进行中 | In Review | IMPLEMENTATION_READY / QA_IN_PROGRESS / REVIEW_IN_PROGRESS / OWNER_ACCEPTANCE_PENDING |
| APPROVE WITH CONDITIONS，未进入真实返工 | In Review | REVIEWED_WITH_CONDITIONS；原开放条件完整保留 |
| DESIGN REQUEST CHANGES且真实设计返工已开始 | In Progress | DESIGN_REWORK |
| 实现Review要求返工且真实编码返工已开始 | In Progress | CODING_REWORK |
| 当前项目完成条件满足且原G-01 MARK_ISSUE_DONE通过 | Done | DONE |

选择器以真实进展证据为准：已开始或已有实现/审查事实时，不因未满足“下一集成阶段”的依赖、parent或Draft PR退到Backlog。Review APPROVE、CI success、PR merge均不推导Done；In Review不推导Owner Acceptance。状态映射使用实际Team读取的状态ID及其name/type，不能按工具默认/名称相近猜测。LEO只读观察已有Backlog、Todo、In Progress、In Review、Done；fixtures保存观察ID，但实现不得硬编码LEO业务ID。Canceled/Duplicate及已有Done与当前证据冲突时BLOCKED，交Master核对；不自动复活或回退已验收任务。

迟到事件不得覆盖较新已核验进度：比较同一执行上下文的实际 `event.occurred_at` / 唯一event_id与前次收据及当前来源，旧 `EXECUTION_STARTED` 或旧Handoff即使本身合法，也不能把已有较新Review/In Review退到In Progress。只允许有实际开始回执、且明确晚于当前已核验来源的 `REWORK_STARTED` 产生这种回退；缺事件顺序、来源冲突或无法确认哪份更新较新时BLOCKED。不得用本次观察时间冒充原事件时间。没有旧收据时，当前状态已比拟写阶段更后而无较新返工依据，同样BLOCKED。

`adapter`是调用方注入的最小接口：

```text
readIssue(execution_issue_id) -> IssueSnapshot
readStatuses(team_id) -> [{id, name, type}]
updateIssue(execution_issue_id, {state_id?, add_blocked_by:[], remove_blocked_by:[]},
            {expected_updated_at, operation_key}) -> WriteResult
persistReceipt(receipt) -> {receipt_ref}
readReceipt(receipt_ref) -> receipt
```

`IssueSnapshot`须含准确Issue标识/UUID、team、parent、state、`blocked_by`集合、`updated_at`及读取来源/时间；适配器负责将实际Linear的identifier/uuid/parent UUID归一到已核验身份。`updateIssue`只允许准确执行Issue的状态及显式关系delta，不替换整份描述、parent、assignee或全部blockedBy；依赖工具分次写入时逐项保留回执，不假装原子事务。`expected_updated_at`是前读冲突检查输入，**不是声称Linear提供CAS**；当前save_issue没有原子expectedUpdatedAt参数。真实适配采用前读、最小delta、后读；发现不同revision/状态/关系时停止并重新计划，不覆盖并发变化。条件写或事务不可用的剩余竞态必须在收据中标为 `verification_boundary:'READ_BACK_OBSERVED_NOT_ATOMIC'`；高风险且此界限不足时BLOCKED，不扩大工具权限。

本库不携带可直接写真实Linear的默认adapter；Master用当前可用工具显式执行或注入受控adapter。本次交付以Mock验证完整调用链，真实Linear只读，不声称已修正PQA状态。

## 依赖、Done、幂等和失败

依赖事实仅描述本Issue明确的当前工作前置：`{issue_id, phase:'start'|'integration', satisfied, evidence_ref}`。新增blockedBy必须有未满足的真实依据；解除必须有已满足/不再适用的明确证据。parent不是依赖；PR Draft/unmerged不是“启动前置未满足”的充分事实。未在本次已核验范围内的现有关系原样保留。只产生 `add_blocked_by` / `remove_blocked_by` delta，保留每个增删依据；下一阶段真实依赖与当前执行进度分别记录。不能删除来源未知的旧关系，也不能因为前置变成Done就忽略其实际验收条件。

`DONE_REQUESTED`必须携带当前完整 `done_input`，直接调用既有 `evaluateActionPreflight`，执行前重读后再调用 `revalidateActionPreflight`，二者均READY才允许Done写入。另核对action为MARK_ISSUE_DONE、仓库/Task Contract/source head/context与当前identity/evidence一致，并将 `subject.execution_issue_id` 绑定准确执行Issue（authorization.subject同样完整一致）；原G-01的Owner Acceptance、CI/QA/Review/发现/授权保持。不得只接受调用方给出的字符串READY、CI布尔值或父CR验收。Done门禁失败时BLOCKED、零写入，不降级伪装为成功。

一次执行的有界顺序：

1. 解析身份/适用性及证据；根据已读取快照生成计划。验证Handoff→ACK先后、当前来源版本/工程阶段与写入授权。
2. 读取准确Issue与Team状态，比较计划的revision/状态/关系；漂移则BLOCKED并返回新观察，不沿用旧计划。当前状态与全部相关依赖已正确时无需写入，但仍读回并产Receipt。
3. 写前再次读取Issue；语义/版本变化先停止。仅对必要state与relation delta写入，每次保留实际结果；没有自动重试循环。
4. 必须再次读取Issue，核对身份、目标state、计划关系变化及无意外修改；即使写API返回成功也不能省略。未变化的无关关系必须保留；执行中并发变化不可静默吞掉。
5. 生成Receipt核心并用 `persistReceipt` 保存，再调用 `readReceipt(receipt_ref)` 回读，逐字段比较核心内容；比较排除 `receipt_ref` 与存储回执，避免正文自引用。仅在实际保存与回读均成功后，在返回结果附上真实 `receipt_ref`。任一环节失败仍为 `PROGRESS_SYNC_FAILED`，不能把内存对象当持久审计。只有收据与读回事实一致才能宣布Verified State。

幂等键由 `execution_issue_id + execution_context_id + handoff_id/event_id + source_head_sha +阶段/目标语义` 产生；同一Handoff重复接收时，如已有 `previous_receipt_ref` 则回读该准确收据，**不能仅凭旧收据缓存成功**，还要读取当前状态/依赖。库不声称具有未定义的全库收据搜索能力。已正确返回 `NO_CHANGE_REQUIRED`，无重复状态或关系写入；漂移后按新事实重新计划。内存同Issue串行防同进程并发；跨会话无共享锁，不宣称exactly-once或跨进程幂等，由最新前读/最小delta/回读发现冲突。请求结果不确定时先回读，禁止盲目重发或重复启动Agent；网络恢复后由Master有界重试同步，不重做已完成Handoff/ACK。

结果语义：`SYNCED`=需要的实际写入与回读全部一致且Receipt已持久化；`NO_CHANGE_REQUIRED`=无需写入并已核验当前状态（GitHub-only明确N/A）；`BLOCKED`=身份/证据/权限/Done门禁/并发前读冲突阻止执行；`PROGRESS_SYNC_FAILED`=读取/写入/回读/持久化失败或写后不一致。部分写入后失败保留实际成功与未知项，不自动补偿、不宣称整个协调成功。

## ProgressSyncReceipt 最小记录

`schema_version:'padf.progress-sync-receipt/v1'`；`receipt_id`、稳定operation_key、attempt_id、上述identity；event/细分stage；准确Handoff/ACK/Task Contract/批准引用；source head、不可变evidence_ref、PR及Review结论/全部开放条件；原Issue状态/updated_at、目标状态、计划dependency delta及依据；实际逐项write_results（含错误/未知）、最后readback（Issue/team/state/关系/updated_at/来源）、检查结果；observed_at/synced_at、result/reasons、failure_items/next_action、consistency界限、实际receipt_ref。不可变attempt记录追加在现有任务/PR线程，不另建数据库或台账。

收据validator须拒绝：成功却无真实回读/写入不一致；SYNCED但无写入；NO_CHANGE却声称写入；错误Issue/context/证据版本；Done缺准确G-01/验收；部分依赖失败；伪造已持久化引用。它只校验结构与相容性，不能认证Linear、运行时或Owner。适配器输出、原始工具回执与Master实际核验共同支撑成功声明。

## TDD 与验收

先提交针对现有缺口的RED测试，再实现最小helper使其GREEN。单一测试入口覆盖纯计划与注入Mock的执行/持久化；独立QA补边界，既有G-01、Design与CACF回归继续运行。

| 回归/负向场景 | 可观察断言 |
| --- | --- |
| W1 ACK / LEO-202 | 只写202至In Review；197零写入，保留Handoff/ACK/source SHA |
| W2 APPROVE / Draft PR / LEO-203 | In Review；Draft不退Backlog，不推导Done |
| W3 APPROVE_WITH_CONDITIONS / LEO-204 | In Review及全部开放条件，不能Done |
| W4 DESIGN REQUEST_CHANGES + 实际返工开始 | In Progress / DESIGN_REWORK；没有开始回执不能声称返工 |
| parent、下一阶段integration依赖 | parent不变blockedBy；已进行工作保留真实状态与合法后续依赖 |
| 解除已满足旧阻塞 | 只删有准确依据的关系，保留其他关系和审计 |
| 重复Handoff/重试 | 最终readback仍核验；已正确零重复写；不重复Agent执行 |
| 缺执行Issue/父CR冒充/错Issue或team/context | BLOCKED、adapter零写入；旧合同增量绑定可兼容 |
| 状态已正确/仅关系需修/只读来源漂移 | NO_CHANGE或最小delta；不把无变更与跳过验证混同 |
| 写失败、未知结果、回读不一致、持久化失败、会话中断后重试 | PROGRESS_SYNC_FAILED，保留实际回执和失败项；先读再重试，无无限循环 |
| 两次并发、前读漂移、写后并发关系变化 | 同进程串行；跨调用冲突可见，不声称CAS或吞掉他人关系 |
| 迟到开始/Handoff、顺序未知、真实新返工 | 旧事件不能覆盖较新Review；无可验证顺序BLOCKED，真实新返工才可回In Progress |
| Done门禁 | 完整准确G-01+Owner验收可Done；仅CI/PR/APPROVE/父验收/旧SHA/伪READY均零写入 |
| GitHub-only #27 | 显式N/A、NO_CHANGE_REQUIRED、零Linear调用；无虚构执行Issue |

PQA历史fixture是Owner给出的失步事实；只读观察显示当前LEO-202/203/204已In Review，LEO-207为In Progress，不能称本次修复了真实项目。Team状态来自实际只读list：LEO的Backlog/Todo/In Progress/In Review/Done分别已有独立ID；fixture可固定这些观察，通用实现按传入Team表处理。此次不改真实PQA/PKMS任务、业务或采用版本。

## Handoff 与停止条件

本设计交Master，独立DESIGN Review后交Coder/QA。现有基线与范围足够；无须PA、SA、UI或Context Coordinator新角色。Coder只实施已审规则；若需真实Linear写入、重大技术取舍、外部服务或Owner完成决定，停止对应动作。设计完成不等于编码放行、Owner验收、合并或发布。

图表manifest：`diagram_type:architecture/component`，用途为Master→计划器/执行器→工具/收据的模块调用关系；权威源为本设计，主任务精确Git源SHA由Master提交后绑定。`generator:diagram-design`；固定外部Skill commit `11b08eade8049c441ed3df1895e3b527c26c0fbe`，实际入口SHA256 `1b30bb3c0da29a05e5b05c0a4510ce6f286a0d0f1da97b9aa6aaf03c92e98618`。已实际读取Skill、Architecture/output/style/profiles/primitives必要指导；复用Owner已选默认风格，离线系统字体，无个人配置改写。

实际验证见[diagram-validation.json](diagram-validation.json)：静态`self_check.py --offline` PASS；Chrome155.0.8059.85 / Playwright1.62.1经获批非受限执行，用独立临时profile实际渲染。5组件/6关系方向逐一实看；文字越界/节点溢出/标签碰撞/远程请求/页面错误均为空，390px页面不溢出、图内可横向滚动，实际中文字体PingFang SC。Module Architect实际查看临时PNG（SHA256 `a9e86832c2784757b43d52d8dc318d67710006e4a97d381d0fe3492772956169`），线条/文字与设计一致；仅提交HTML源和验证结果，不增加多格式导出。此PASS只证明本图的生成、渲染与实看，不证明Linear同步、产品行为或DESIGN_READY。
