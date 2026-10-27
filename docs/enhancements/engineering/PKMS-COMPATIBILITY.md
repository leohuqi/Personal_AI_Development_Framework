# ENG-QA-01：PKMS固定版本只读兼容评估

**可复用其已有测试/报告/RTM机制作为PADF通用契约的一个项目适配案例；尚不能据此宣称PADF正式能力已验证、完整M2业务已验收或项目已升级。** 本次仅用GitHub connector读取固定版本源码、结构化报告及CI元数据，没有运行PKMS测试、下载artifact/私人原件、修改代码/锁/PR/Linear或操作NAS。

| 对象 | 实际固定来源与观察 |
| --- | --- |
| 项目main | 只读回查仍为`23c40d445ceb8a2db01d68065e3ee351b3c44449` |
| PR10 | head `efd0aa0faf0583a25048b9869288fff529278152`；base是`impl/m2-first-slice-v01@269407b0a41c94f4a75ba30b8c5f0073e8a7fcf2`，并非main；实时open/unmerged、draft=false，正文“保持Draft”是旧摘要 |
| 产品来源 | [Feature Catalog@efd](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/PRD-FEATURE-CATALOG.md)保留22个固定Feature ID；文件自称M0_BASELINE_PROPOSED，不能从字段存在推导Owner批准 |
| 测试策略 | [Testing Architecture@efd](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/architecture/TESTING-ARCHITECTURE.md)：pytest、FastAPI组件、真实隔离SQLite/文件、Vitest、Playwright；Functional跨层，真实依赖与Mock边界明确 |
| Functional TC | [32个原功能用例@efd](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/FUNCTIONAL-TEST-CASES.json)：目标/前置/数据/步骤/预期/风险/层级齐全，源规格摘要固定，完整执行均NOT_RUN |
| RTM候选 | [RTM@efd](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/RTM.json)关联7 Feature、17 Requirement、16 AC、32 FT、44技术用例与583条关系，其中537 PARTIAL、46 NONE；静态源仅NOT_RUN，不手填PASS |
| 历史实际运行 | [BASELINE-RUN@efd](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/BASELINE-RUN.json)准确被测SHA是`73d46957ddaeae99a56c3171db987a4e082b8da4`：61 Python（31产品+30工具/设施）、12 Web、1 HTTPS E2E；产品技术结果44 PASS，FULL记录0。该运行不是本次QA执行，也不能自动套用到efd新SHA |
| Coverage/完整需求 | 历史Python line86.61%/branch63.84%，Web line37.17%/branch16.07%，各有独立分母与零命中模块；完整16AC/32TC仍NOT_RUN，15AC/26TC只有PARTIAL证据，不能推导Feature验收 |
| 当前CI与artifact | [40439767901](https://github.com/leohuqi/Personal-Knowledge-Library/actions/runs/40439767901)直接读取run对象，event=pull_request、head_sha=efd、completed/success；存在未过期`pkms-quality-40439767901` artifact（12706001880），未下载/重跑其内容。另静态CI40439767944成功 |

测试策略、[RTM Schema](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/RTM-SCHEMA.json)、[Run Schema](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/RUN-SCHEMA.json)及[CI源码](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/.github/workflows/m2-first-slice.yml)提供可衔接接口：固定selector、准确运行/源码版本、PARTIAL/FULL分离、JUnit/HTML/coverage、失败时always上传诊断且测试步骤保留非0。现有统一入口可减少跨文件寻找结果；本次没有浏览HTML或测量Owner阅读时间，不把链接存在当可用性实测。

通用化必须保留的边界：PKMS Schema中`runner=[pytest,vitest,playwright]`、`PKMS-Fnnn`及`LEO-nnn`是项目约束，PADF不能照搬；按通用框架/稳定ID适配。583条追溯边不是583次执行，44技术测试也不是完整32FT通过；计数和需求覆盖应按唯一对象及有效FULL证据计算。未批准候选、过期或不匹配版本须保持可见，不从工程报告升级Owner批准。

[PKMS Superpowers Lite@efd](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/SUPERPOWERS-LITE.md)与[锁@efd](https://github.com/leohuqi/Personal-Knowledge-Library/blob/efd0aa0faf0583a25048b9869288fff529278152/docs/testing/SUPERPOWERS-LOCK.json)记录上游`2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`的TDD、systematic-debugging、verification-before-completion三项项目适配：不装全局插件，不为每个微循环另建commit/报告，历史产品TDD=NOT_VERIFIED。文字规则没有强制新增角色或重复审批，适合作轻量参考；本次未独立读取上游全文/许可或实际运行新开发循环，因此正式PADF锁定/许可核验及“实际开销无增加”结论仍需本任务真实证据。

后续受控接入需单独批准项目采用版本、准确main/PR与既有测试策略，保持现有M2 Feature IDs/AC/TC和项目锁，先做薄适配与代表性增量，再按项目门禁交QA/Review/Owner。PADF Draft PR的完成不授权改PKMS业务、合并PR10、NAS验证或部署。
