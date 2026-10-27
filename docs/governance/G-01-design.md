# G-01：Master 主动治理与 Owner 决策保护

## Existing-State Assessment

基线固定 PADF v0.3.2@15866db0cf09c5ac5d44b5bdb5c62e311c553ee2，当前main相同。已读取Master/Independent Reviewer Skills、Approval Policy、Task Contract、Design Gate、Dispatch契约与orchestration-evidence。已有设计就绪、分派范围和四阶段真实执行检查；分派评估器明确不允许从ANALYZE/REVIEW等权限继承编码/合并。现有工作流要求独立审查与Owner验收，却没有统一的合并/发布/部署/Done前操作预检或执行前快照复核。

PQA历史记录证明问题是流程控制：PR7合并前CI成功、真实独立审查NOT RUN，合并后LEO-157曾短暂Done。此事实不能直接推导业务代码有错或需要回滚，详见[历史例外](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/v0.3.7/docs/governance/PQA-PR7-process-exception.md)。本任务不修改PQA或Linear状态，也不把事后审查重写为合并前通过。

## 风险与最小方案

| 风险 | 控制 |
| --- | --- |
| Owner说“合并”被当作豁免 | 单独投影已有Owner授权，仍检查所有适用技术/审查门禁；请求不是豁免 |
| Dispatch、自审或绿色CI冒充独立审查 | 不同实现/Master上下文、真实执行来源、精确Base/HEAD及实际diff、Handoff或Review证据 |
| 旧审查/批准/预检继续用于新版本 | 精确范围绑定、有效来源快照、操作前重读；重验证所有必要证据并比较预检摘要 |
| Merge→Done冒充验收 | 分离8种生命周期证据，状态核对识别无验收的Done；平台规则不可验证时用审计与补偿控制 |
| 新门禁成为授权或执行引擎 | 一个纯函数只读模块，无网络/运行时/凭据/merge/deploy能力；实际权限仍来自既有政策/Task Contract/远端Owner |

流程：Owner Request → Master Preflight → Readiness Decision → Authorized Action → Evidence Reconciliation。六种保留动作共用[Action Preflight契约](../../contracts/action-preflight.md)。`READY`仅表示已核验输入一致，`BLOCKED`表示缺强制条件，`NEEDS_OWNER_DECISION`表示其余条件就绪但缺适用Owner决定/可选规则例外。BLOCKED优先，不因Owner授权存在而变READY。

复用Design Gate的真实输入重新调用evaluateDesignGate，而非信任一个DESIGN_READY标签；复用现有Dispatch/Orchestration与Handoff来源语义，不改原evaluateDispatchAuthorization。对真实独立审查使用同样的运行时/HUMAN_RELAY证明，并额外绑定Base/HEAD/diff与条件。没有另建Owner授权服务，authorization只是既有Owner记录/Task Contract的只读投影。

本框架不能在GitHub服务器强制拦截任意手工点击；Master工具调用前必须执行流程，服务器保护依项目计划/权限另配。通过Node回归不能声称服务器保护、Linear自动化配置、真实Owner身份或实际Agent执行已验证。TOCTOU复核与实际调用仍非原子事务；GitHub操作必须使用匹配HEAD的条件请求（如match-head-commit），无条件保护的工具返回人工核验/阻断，不拿静态PASS代替原子约束。

## 授权、例外与推进

v0.3.2批准范围内分派继续，无新增逐次批准。编码、合并、发布、部署、验收、Done均按各自范围；没有必要Owner决定时请求一次清楚的决定，不把常规技术检查推给Owner。P0/P1、精确版本/独立性、必要设计/QA/CI及验收、范围和实时核验不可走普通例外；只允许项目明确列出的可选检查采用有界Owner例外，保留风险/条件/补救/复核。

未知或缺失必要输入按失败处理，发现列表/阻塞也需显式空数组；不把“没有读取”称为“没有问题”。所有结果给出简短门禁状态与下一步，主成果/Owner决策入口优先，审计在附录。

## 交付及限制

独立分支/PR基于v0.3.2，不并入未合并的PR13角色优化；双方修改Master等文件，未来整合需重核受影响差异，不能复制旧审查批准。完成契约、只读评估、回归/CI、历史记录和真实独立审查后，回Owner入口等待验收/合并决定，不自动创建Release。实际平台配置检查结果、补偿控制和未测项见[操作手册](../../workflow/action-preflight.md)。
