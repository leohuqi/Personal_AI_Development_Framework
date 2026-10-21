# Action Preflight Gate — G-01

Schema：`padf.action-preflight/v1`。实现：`lib/action-preflight.mjs`，Node内置依赖；纯只读，输入为Master从真实权威来源核验后的投影，不签发权限、不认证链接/远程批准、不执行操作。授权源仍为[Approval Policy](../governance/approval-policy.md)、[Task Contract](task-contract.md)，不替代或更改[Dispatch授权](agent-dispatch.md)。

## API与共用输入

- `evaluateActionPreflight(snapshot)` → `{decision: READY|BLOCKED|NEEDS_OWNER_DECISION, action, reasons[], checks[], next_steps[], fingerprint, verification_boundary}`。
- `revalidateActionPreflight(previousResult, freshSnapshot)`：实际调用前完整重新评估；previous须READY、语义摘要相同、实时快照新鲜，否则BLOCKED，不能仅比较HEAD。结果不是执行令牌。
- `reconcileActionEvidence(snapshot)`：八项证据分别报告，识别无Owner验收的当前Done，提出人工/有授权补偿，不更改外部状态。

`snapshot`必需字段：

```text
schema_version: padf.action-preflight/v1
now: ISO时间（由调用方真实时钟取得）
verification: {verified:true, observed_at, valid_until, evidence_ref}
action: MERGE_PR | START_CODING | RELEASE | DEPLOY_PRODUCTION | OWNER_ACCEPTANCE | MARK_ISSUE_DONE
subject: {repository, context_id, task_contract_ref, environment, target_ref,
          base_sha, head_sha, pr_number? , merge_method?}
authorization: {status:APPROVED, owner_approval_ref, action, subject:<同一完整subject>}
policy: {evidence_ref, review_required:true|false, qa_required:true|false,
         task_class:S|M|L|XL, impacts:[], risk_flags:[],
         review_skip_ref?, qa_skip_ref?, allowed_base_refs?:[], allowed_merge_methods?:[],
         optional_checks?:[{id,status:PASS|FAIL|NOT_RUN,evidence_ref?}]}
findings: []
blockers: []  （当前未解决关键依赖/阻塞列表，任何非空项阻断）
```

subject所有字段影响授权范围/摘要，必须准确：仓库、上下文、契约、环境、目标、40位Base/HEAD；MERGE另含正整数PR号及合并方式。authorization是已有明确Owner记录的投影，action/subject精确相同，不能把“批准合并”复制成“批准发布”。缺Owner决定在其他门禁就绪时NEEDS_OWNER_DECISION；撤销/过期/范围不符BLOCKED。verification须可核验引用，observed_at≤now≤valid_until且窗口不超过5分钟，未来/陈旧/缺失阻断；该时间检查不能代替真实读取或认证。

## 动作所需证据

下表只列增量，其余共用门禁仍检查。各证据包含准确head_sha与evidence_ref，不从其他状态推导。

| 动作 | 必需 |
| --- | --- |
| MERGE_PR | implementation.status=COMPLETE；CI/适用QA；独立实现Review；pr={state:OPEN,draft:false,number,repository,base_sha,head_sha,base_ref,merge_method,evidence_ref}与subject及policy允许分支/方法匹配 |
| START_CODING | `design_input`为原Design Gate完整输入；重新evaluateDesignGate得到DESIGN_READY且coding_authorized=true；design_input附repository/context_id/task_contract_ref/source_base_sha/source_head_sha匹配subject；coding_authorization与外层原Owner引用/Task Contract相同，feature_spec_ref等由Master核对；不要求尚未发生的实现CI/QA/实现Review |
| RELEASE | implementation、CI/QA/独立实现Review；release={target_sha,tag,tag_available:true,notes_ref,rollback_ref,source_merge_ref}，版本目标匹配subject.target_ref/HEAD |
| DEPLOY_PRODUCTION | implementation、CI/QA/独立实现Review；release={published:true,target_sha,evidence_ref}；deployment={environment:production,artifact_sha,runbook_ref,rollback_ref,recovery_verified:true}，subject环境必须production |
| OWNER_ACCEPTANCE | implementation、CI/QA/独立实现Review，Owner明确此动作/精确成果范围；不把PR合并当此决定 |
| MARK_ISSUE_DONE | 与验收同等技术门禁，另需acceptance={status:ACCEPTED,head_sha,context_id,task_contract_ref,evidence_ref}精确匹配；Done授权不能替代Acceptance |

CI为`ci:{status:PASS,head_sha,evidence_ref,checks:[{name,status:PASS,head_sha,evidence_ref,required?:true}]}`，至少一项必需且全部必需项PASS。QA为`qa:{status:PASS,head_sha,evidence_ref,untested_required:0}`，未执行/阻塞不能PASS。START_CODING不运行后验CI/QA门禁，但Design Gate和单独编码授权不可豁免。

policy必须明确review_required/qa_required；不可缺省为“不适用”。所有实施后动作默认应要求Review/QA；仅低风险项目政策允许明确false，附review_skip_ref/qa_skip_ref。L/XL或现有routeAgents识别的风险不得关闭Review。没有复用CI当Review的捷径；即便非强制Review，只要实际提交REQUEST CHANGES或已知阻断发现也不能忽略。

## Fresh-Context Review

`execution_context:{implementer_session_ref,master_session_ref}`，`review`：

```text
status: COMPLETED
decision: APPROVE | APPROVE_WITH_CONDITIONS | REQUEST_CHANGES
mode: IMPLEMENTATION
base_sha / head_sha: 与subject完全相同
actual_diff_reviewed: true
diff_ref: 精确Diff引用
execution: {execution_id, session_ref, execution_mode:RUNTIME_DISPATCH|HUMAN_RELAY,
            evidence_ref, runtime_task_ref? , human_start_ref?}
handoff_ref 或 github_review_ref
conditions: [] （附条件结论必须非空）
findings?: [] （若给出与共用findings一起检查）
```

Review会话与Implementer和Master都不同；RUNTIME_DISPATCH须工具任务证据，HUMAN_RELAY须真实人工启动佐证。ROLE_SIMULATION、自审、Dispatch评论、CI不能替代。缺真实Review给BLOCKED/INDEPENDENT_REVIEW_NOT_RUN及HUMAN_RELAY路径。独立性/精确版本/必须Review不可走普通例外。附条件只有全部`{status:COMPLETED,evidence_ref}`或逐项有效Owner风险处置才可通过；修复改变HEAD必须重审。

findings需severity P0/P1/P2/P3与status；P0/P1非FIXED必阻断，P2非FIXED须`risk_acceptance:{status:APPROVED,explicit:true,owner_approval_ref,action,subject:<完全匹配>,conditions,remediation,recheck_ref}`。conditions使用同一结构risk_acceptance表达明确处置；不把普通merge授权自动转换成风险接受。Master从真实报告核对所有发现，未读取不等于空列表。

## 非强制例外

只处理policy.optional_checks中明确项目自定义的可选项，id不得占用CI/QA/REVIEW/AUTHORIZATION/DESIGN/ACCEPTANCE/DEPENDENCY/HEAD或P0/P1等强制规则名称。失败/未运行的可选项且无有效例外时NEEDS_OWNER_DECISION；强制失败仍优先BLOCKED。`exceptions[]`每项为：

```text
exception_id, rule_id, action, subject:<同一完整subject>,
status: APPROVED, explicit:true, owner_approval_ref,
risk, conditions, remediation, recheck_ref
```

Owner须明确豁免哪个规则/准确任务和HEAD、接受风险及补救/重新核验要求；可在同一条Owner回复明确多项授权，但投影必须保留各项真实含义，不能凭普通合并指令补出例外。P0/P1、必要Review/独立性、授权/范围/实时版本、适用CI/QA/Design、Acceptance或关键依赖不受exceptions覆盖。紧急旁路不属于普通接口。

## TOCTOU与生命周期

fingerprint采用语义输入的稳定SHA256摘要（不含now及verification观测时间/链接，实时有效性仍每次重查），覆盖动作/subject、授权状态、政策、Review/CI/QA、发现/阻塞、设计/发布/部署/验收及例外。调用前再次获取实时HEAD/Base、批准状态、证据与平台状态；相同HEAD但撤销批准或新发现同样阻断。摘要变化必须重做正常预检，不带旧READY执行；真正操作使用工具原子HEAD匹配，失败后重核，不自动重试。

reconcileActionEvidence分别输出IMPLEMENTATION_COMPLETE、CI_PASSED、QA_PASSED、INDEPENDENT_REVIEW_PASSED、PR_MERGED、OWNER_ACCEPTED、ISSUE_DONE、PRODUCTION_DEPLOYED及证据状态；不存在的证据为NOT_VERIFIED。输入issue={status_type:completed或started,evidence_ref}，观察completed却缺精确acceptance时产生DONE_WITHOUT_OWNER_ACCEPTANCE异常和审计/有授权恢复In Review建议，ISSUE_DONE不得标已验证。不会因pr.merged=true推断Owner接受，也不会执行恢复。

相关[操作手册](../workflow/action-preflight.md)、[设计评估](../lib/design-gate.mjs)和[Orchestration Evidence](../lib/orchestration-evidence.mjs)均保持各自边界。模拟快照只验证判定逻辑，真实连接器/权限/集成映射由Master现场核验。

生命周期输入implementation={status:COMPLETE,head_sha,evidence_ref}、CI/QA/Review如上；pr={merged:true,merge_commit_sha,evidence_ref}的merge_commit_sha须匹配当前subject.head_sha，不能把PR原head当merge落地主分支版本；acceptance如上；deployment={status:DEPLOYED,environment:production,artifact_sha,evidence_ref}。reconcile输出states[上述八枚举]={status:VERIFIED|NOT_VERIFIED,evidence_ref或null}、anomalies[]及recommended_actions[]；独立事实不互相推断。

缺authorization或合法空对象/PENDING为待决定，其他畸形结构（数组、null等）、撤销或范围不匹配为BLOCKED。已解决的关键阻塞在历史来源保留，当前blockers清单只列未解决项；缺清单不等于无阻塞。
