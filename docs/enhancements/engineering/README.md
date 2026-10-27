# Engineering 增强：Owner 阅读入口

本候选把测试架构、渐进功能测试、TDD/调试/完成核验、追溯和报告融入现有七角色。项目自主选择技术栈，旧项目增量接入；不增加测试执行引擎、服务、角色或第二审批。**尚未获Owner验收、合并或发布，正式版本未指定。**

建议先审阅[共享工程标准](../../../standards/engineering/README.md)，重点判断职责是否清楚、报告是否足以看出真实缺口，以及迁移成本是否合理。准确候选SHA、独立QA/Review、当前CI和待处置发现集中在[Draft PR #30](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/30)，可在PR或当前对话反馈；技术通过不自动等于Owner验收。

| 想看什么 | 权威入口 |
| --- | --- |
| A/B：方法与七角色增量 | [共享标准与角色责任](../../../standards/engineering/README.md#什么时候做什么)；各核心Skill保留原授权边界 |
| C/D/F：测试策略、RTM与报告 | [测试架构](../../../contracts/testing-architecture.md)、[追溯](../../../contracts/requirements-traceability.md)、[跨语言报告](../../../contracts/test-reporting.md)；JSON Schema与实例相互验证 |
| E：Superpowers轻量适配 | [三方法、固定来源与差异](../../../integrations/superpowers-lite.md)，不安装其他调度/规划流程 |
| G：可复现运行及原始结果 | [Python/Java合成试验](../../../examples/engineering/README.md)、[独立需求侧用例](QA-CASES.md)、PR精确SHA的CI artifact及QA记录；失败控制与产品通过分开 |
| H：设计、Review与迁移 | [已冻结设计/组件图](DESIGN.md)、PR独立DESIGN/实现Review；[增量迁移与回退](../../../standards/engineering/README.md#现有项目迁移) |
| PKMS接入影响 | [固定版本只读兼容评估](PKMS-COMPATIBILITY.md)，未改PKMS业务、PR、项目锁或NAS |

报告必须把Unit通过、代码line/branch覆盖、完整AC验证和Owner验收分开；多对多关联及PARTIAL不能扩大通过数量。高风险试验包含实际权限/事务缺陷、薄弱修复的失败，以及正确实现对同一独立探针的结果。A–E以实际运行/原始证据为准，不以文档存在当完成。

本轮Python真实依赖为隔离SQLite，Java为JUnit Jupiter与真实临时文件系统、JaCoCo；没有验证Spring运行时、.NET、Go或生产数据库。PKMS仅做已有代码/测试/CI/报告的只读兼容观察，不据此声称完整M2功能已验收。工程与PKMS交付分别评估；PR #28进度协调增强也未并入本分支。
