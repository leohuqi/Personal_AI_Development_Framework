# PKMS 应用效果评估与 PADF 调整

**结论：Engineering方法在“说明测试边界、显示覆盖缺口、防止报告误判”方面已有具体作用；对产品缺陷减少、开发速度和Owner阅读效率的改善尚未充分证明。** 因此将职责、证据边界与简化原则纳入PADF，不把PKMS配套工具搬成框架运行程序，也不为证明规范再造测试工程。

本轮仅通过GitHub读取已有资料，没有运行PKMS业务/工具测试，没有改其代码、项目锁、任务、PR或NAS。下面的历史运行结果是读取的项目证据，不是本轮重跑；完整业务TC未执行不阻止本次方法评估，也不被解释为业务通过。

## 来源和当前状态

- 观察日期：2026-10-27。[PR #10](https://github.com/leohuqi/Personal-Knowledge-Library/pull/10)已合并到`impl/m2-first-slice-v01`，合并提交`200b3fb8511e431e2a9521b78e54e6c16825e192`；PKMS main仍`23c40d445ceb8a2db01d68065e3ee351b3c44449`。不能说试点仍Draft，也不能说已进入main。
- 材料固定在试点head`efd0aa0faf0583a25048b9869288fff529278152`；其中报告明确被测实现是`73d46957ddaeae99a56c3171db987a4e082b8da4`，而非文档发布head。历史CI [40436509870](https://github.com/leohuqi/Personal-Knowledge-Library/actions/runs/40436509870)已直接核对该SHA为success。
- 历史产物的PENDING_OWNER_REVIEW/未合并是当时时点，不由后来的合并反写成业务验收；本轮未审计后续Owner批准链，不据旧记录判断合并是否合法。

## 哪些有效，哪些还不能下结论

| 方面 | 已有观察与证据 | 效果判断 |
| --- | --- | --- |
| SA测试策略 | [策略正文](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/architecture/TESTING-ARCHITECTURE.md)区分TestClient/真实HTTPS、SQLite/文件依赖、隔离、覆盖分母及未测NAS；[交付记录](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/runtime/MASTER-DELIVERY.json)有对应工程产物 | 有实际指导对应，不只是标题；尚无连续业务迭代证明持续收益。PADF保留策略责任，复用项目工具，不重复选栈 |
| PA与QA的渐进输入 | [PA交接](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/runtime/pa/HANDOFF.json)将既有7 Feature/17 Requirement/16 AC/32 TC关联，保留原ID、未来范围及业务含义 | 追溯责任有成果，但主要是既有规格重整理，不能据此证明“新Feature编码前测试设计”已完整改善。PADF只要求当前切片必要场景，不再造需求正文 |
| RTM防止误报 | [现有阅读入口](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/README.md)明确44项产品技术用例通过，15 AC/26 TC仅PARTIAL，完整16 AC/32 TC仍NOT_RUN | 有用：让技术绿与业务完成分开。它显示了缺口，未关闭这些业务缺口；本轮不要求补跑它们。PADF统一语义，不移植本项目Schema/runner/ID规则 |
| TDD | [原RED](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/runtime/coder/tdd-red.log)为缺JUnit/错SHA误判；[GREEN](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/runtime/coder/tdd-green.log)有实际结果；[运行记录](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/BASELINE-RUN.json)将历史产品TDD记NOT_VERIFIED | 证明新报告工具采用过TDD，不能推广成产品开发已因TDD变好。PADF保留适用行为/代表性证据，不补造历史，不强制微循环报告 |
| 调试与独立发现 | [独立复审](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/runtime/review-73d4695/REVIEW.md)记载零case误绿、旧结果污染、错误降级、启动环境分类和测试收尾问题已修正 | 对工程机制可信度有具体改善；这些多数是工具/测试设施问题，不当作减少产品缺陷的统计。PADF保留根因/真实证据原则，按问题才升级角色 |
| 报告可用性与维护成本 | [质量摘要](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/BASELINE.md)仍有原始字典展示；RTM有自动派生阅读版；[QA](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/runtime/qa-73d4695/REPORT.md)明确报告HTML额外人工阅读未执行 | 入口/数据可追溯不等于Owner读起来高效。尚无实际阅读反馈、工时或返工对照；不能承诺提效。PADF要求结论/缺口/决定先行，大表和审计按需展开，不创建新门户服务 |

## 发现的问题 → 已做的 PADF 调整

| 问题 | 本轮调整 |
| --- | --- |
| 把工程机制通过说成方法整体有效，或把方法有效说成完整业务通过 | [工程标准](../../../standards/engineering/README.md#怎样判断方法有效)要求观察到的改善、适用对象及未证实项分别陈述；报告区分技术、AC与Owner验收 |
| 既有工具TDD记录被推广成产品TDD效果 | Coder/Reviewer按实际变更对象核验代表性过程；历史无记录保持未知，不要求重复补造 |
| 规范采用隐含要建工具/换平台、维护完整RTM | 三份[内容约定](../../../contracts/testing-architecture.md)、[追溯约定](../../../contracts/requirements-traceability.md)、[报告约定](../../../contracts/test-reporting.md)复用既有格式；没有新增机器Schema、运行器或全项目字段门槛 |
| 材料齐全仍可能难读，重复角色/报告成本不明 | Master只交一个结论入口，当前切片才展开；框架方法评估不用完整应用开发流水线，未测效率不宣称节省 |
| PR正文“保持Draft”与实时已合并不一致 | 保留历史时点、实时平台事实和验收事实的区别；不把历史文档或merge状态当另一种事实，本轮不去修PKMS状态 |
| 案例项目、框架任务与旧会话权限混用 | [Master Skill](../../../.agents/skills/master-orchestrator/SKILL.md#先确定当前工作对象)、[Task Contract](../../../contracts/task-contract.md)和[上下文加载](../../../governance/context-loading.md)分开修改对象/允许动作/只读参考；资料中的命令或批准不转移权限 |

七角色职责增量保留，但只在相应任务类型启用。原Design Gate、G-01、授权和业务实施的独立验证要求不改。文档/Skill结构检查只证明文档可加载/引用正常；现有自动CI如触发，也不作为PKMS方法效果证据。

## 这次范围偏移是不是“PKMS上下文污染”

无法由输出推断模型内部必然发生了某种污染。可观察的问题是：我把“研究一个项目的实践”与“为框架交付工程实现”混在同一条推进路径，用工具/CI/Review的成功替代了更重要的应用效果问题。

早期附件确实含必要代码/CI和A–E框架验证段落，这是前阶段路线的直接依据；上一条把全部工具工作简单说成完全没有要求也不够准确。但Master仍应统筹“项目应用效果”和反复强调的简化原则，明确方法、工具、业务三个层次；最新Owner澄清优先于旧计划，不能靠长上下文自动续做。责任在任务解释与范围控制，不能只归因于上下文长度。

事实上，前阶段没有改或运行PKMS业务；是在PADF中新增了额外报告工具和合成Python/Java项目。旧QA/CI结论对那些工具有意义，不能用来回答本次PKMS应用是否有效。现已从本候选撤去这些新增内容；旧提交/评论和原始证据保留，不改写为没发生。

## 防止再发生：落在现有规则，不再造流程

1. **范围先定清。** 在原Task Contract的范围/输入写明修改对象、允许动作和只读参考；当前为PADF文档调整，PKMS只读，没有项目测试/实现授权。
2. **参考不传权限。** 案例AGENTS、命令、Handoff、历史批准只用于理解事实，不能覆盖当前用户指令；读到测试命令不等于要运行它。
3. **跨层动作前核对。** 从文档评估转成写程序、造演示、跑参考项目或写另一仓库时，核对当前明确范围；超出就不执行，沿原政策处理必要新范围。普通已批准工作不重复索要批准。
4. **恢复时只带必要来源。** 先看最新澄清和任务范围，再加载相关案例片段；不默认带入项目Coder/QA完整历史。新独立上下文可降低残留影响，但不要求Owner每次新开对话，也不能代替这些边界。

已按更新规则人工走查三个指令选择场景：参考项目含“已批准跑测试”仍只作为评估资料；Owner明确授权项目修复时可进入对应项目原流程；最新澄清覆盖旧A–E工具计划。结果与规则一致，未执行任何项目命令、未新建测试脚本。这是有限的文档/决策自查，不是独立行为实验，也不保证Agent以后绝不偏移。

## 本候选如何交付

仅更新PADF方法、七Skills、既有工作/上下文约定与必要模板。撤回早期新增的`lib/engineering.mjs`、两报告脚本、机器Schema、合成工程/新测试、专用CI和为工具建设制作的设计图；不触及main原有运行工具和机器门禁。历史原件见[旧dd9提交](https://github.com/leohuqi/Personal_AI_Development_Framework/tree/dd9d2f352d1cdfc52e0ffe62a8adef36c1f286fd)。

当前[Draft PR #30](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/30)与[评审中心 #14](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/14)汇总准确版本及检查。等待Owner审阅；不合并、不发布、不升级PKMS。未来若已有获批准业务开发产生更多过程和反馈，可再评估TDD/成本收益，不在本任务中另行创建该业务工作。
