# Master 主动操作门禁与证据协调（G-01）

本流程在[原审批政策](../governance/approval-policy.md)之上落实操作顺序，不新增批准服务。六项保留操作必须在工具调用前执行；“Owner请合并”是操作请求/授权来源，不是缺失Review、CI或验收的隐式豁免。

## 每次操作的最小步骤

1. **识别动作与范围。** 从现有Task Contract、Owner原话及当前目标取得操作级授权/范围，保留源链接；分别识别MERGE_PR、START_CODING、RELEASE、DEPLOY_PRODUCTION、OWNER_ACCEPTANCE、MARK_ISSUE_DONE。相同有效授权可复用，不重复问Owner；不同动作或扩大范围不能继承。
2. **先读取，后判断。** 读取实时PR/Base/HEAD、目标分支/方法、全部必需CI、适用QA、真实独立Review执行/Handoff及准确Diff、P0–P3和条件/风险处置、关键依赖、批准状态。明确项目政策/风险，未读记NOT VERIFIED；普通Owner授权不能补成例外。按[契约](../contracts/action-preflight.md)形成已核验快照，保存来源/观测时间。
3. **只读Preflight。** 调用evaluateActionPreflight，保存动作/subject、摘要、逐门禁状态、证据和结果。READY才能进入下一步；BLOCKED先补证/返工，不调用普通保留操作；NEEDS_OWNER_DECISION只提交真正缺少的决定/明确非强制例外。已在批准范围内的Reviewer分派由Master自行启动，不把流程责任交给Owner记忆。
4. **执行前再核验。** 操作工具调用前重新读当前HEAD/Base、Owner批准是否撤销、CI/Review/发现/依赖/目标规则。重新evaluate并用revalidateActionPreflight核对上次READY摘要；任何语义漂移先阻断，重做正常预检和受影响审查。技术上独立函数无法消除重读与调用间的竞态，合并工具还须用准确HEAD的条件匹配（例如match-head-commit/sha）。不支持条件调用且无法保证范围的工具不得无条件执行，换支持工具或标BLOCKED。
5. **执行与协调。** 仅执行已授权动作，记录真实工具回执/操作ID/实际提交和时间，不预先写“已合并”。重试先读实际结果，防重复执行。事后读GitHub/Linear，调用reconcileActionEvidence分别核对八种事实；与预期不符记治理异常，不涂改历史，不自动启动未授权生产或状态修正。

## Owner 决策保护的简明展示

| PR Merge Readiness | 当前证据 |
| --- | --- |
| CI | PASS @准确HEAD |
| QA | PASS @准确HEAD |
| Independent Review | NOT RUN（无真实独立Execution/Handoff） |
| Blocking Findings | 无已知开放项；不是对未知结果的保证 |
| Owner Merge Authorization | GRANTED @本操作/准确范围 |
| Overall | **BLOCKED / INDEPENDENT_REVIEW_NOT_RUN** |

下一步优先在已批准范围启动真实独立Reviewer；缺运行能力时给出可读的Dispatch/Task Contract链接，请Owner在新会话按固定Base/HEAD启动，记录HUMAN_RELAY及实际启动/执行/Handoff，不能先造Execution。获得APPROVE或完成全部附条件处置后重新预检。普通“可以合并”不要求Owner再批准同一操作，也不能替他补出Review豁免。

可选规则的例外使用原Owner明确决定，列Exception ID、规则、准确任务/HEAD、风险、条件、补救、复核。P0/P1、必要独立审查/独立性/精确版本、适用CI/QA/Design、授权、Acceptance和关键依赖不通过普通例外。紧急机制需另行批准/审计，本普通接口不提供紧急旁路。

## Linear ↔ GitHub 状态核对与补偿

事实分别为IMPLEMENTATION_COMPLETE、CI_PASSED、QA_PASSED、INDEPENDENT_REVIEW_PASSED、PR_MERGED、OWNER_ACCEPTED、ISSUE_DONE、PRODUCTION_DEPLOYED；一个状态不推导另一个。Done必须有当前成果精确Owner Acceptance；Merge不是Acceptance，已合并后才做的Review仍标事后补证。

优先由有权限人员检查Linear的GitHub集成、团队工作流及合并自动状态映射；若配置允许，应把合并落点保持In Review/等价待验收状态，明确Owner验收后才Done。改配置需记录具体范围和原/新设置、实际保存证据，并通过获授权非生产场景验证；仅创建文档/CI或看见Issue恢复不证明平台映射已关闭。

**本轮真实检查限制（2026-10-21）：** Connector可以读取LEO-157及stateHistory，但未暴露集成配置读写接口；in-app浏览器进入Linear后显示登录页，现有连接器登录不代表浏览器管理会话。未验证当前具体Merge→Done规则、权限/计划是否允许调整，未更改任何设置或LEO-157状态。不能声称平台自动规则已停用。

因此采用显式补偿：操作前记录当前Issue状态及Owner Acceptance缺口；合并后立即重读关联Issue并逐项协调。新观察到Done但无准确验收时，记录DONE_WITHOUT_OWNER_ACCEPTANCE及原状态/时间/来源，保持治理验收BLOCKED；有项目状态修正授权时由Master先预检相应状态操作/核对范围再恢复In Review，无该权限时交Owner/管理员执行。此G-01任务明确不授权改PQA状态，只报告异常和补偿建议。状态恢复不等于关闭平台自动化，后续每次仍核对。

没有守护进程，后台自动转换不能靠本仓库代码自动拦截；每个获授权活动会话承担前后核对，跨会话恢复时重新读取来源/未解决异常。平台规则和安全试验仍是待验证项，交Owner决定是否授权进一步配置验证。

## 本地验证与交付

```bash
node scripts/validate-cacf.mjs
node tests/v0.3/run-preflight-tests.mjs
node tests/v0.3/run-orchestration-tests.mjs
```

另运行原Design/CACF/质量回归及CI。参数化合成输入只能证明函数判定，不等于真实Owner批准、Agent/Figma执行或平台设置验证。独立PR精确SHA须由另一个真实Reviewer会话审查实际diff并出具真实Handoff；Master不能自批。验收清单见[交付模板](../templates/action-preflight.md)。

START_CODING始终合并当前Task Contract与设计快照已知风险后重跑Design Gate，不允许旧S/无风险快照抹去当前L/XL、permissions/security等强制设计审查。事后PR_MERGED保留PR源Base/HEAD和实际合并提交两套版本，正常merge/squash不会因两者不同被误报；低风险按政策明确NOT_RUN的可选Review不新增强制审查，已知阻断结论/发现仍阻断。
