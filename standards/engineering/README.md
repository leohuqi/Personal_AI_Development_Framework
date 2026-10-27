# 工程测试与交付质量

把当前批准的行为变成可验证实现，并让人从一处找到用例、真实结果和缺口。工程方法增强原有设计、QA、Review和交付，不新增 Engineering Gate、角色或批准轮次；测试工具由项目选择。

## 什么时候做什么

- PA在High Level Specs/Catalog明确稳定目标、规则、AC及重要正常/异常/权限场景；QA在需求形成时参与Functional Scenarios，当前切片准备实施时才细化TC。不预写全部未来用例。
- SA在新系统或测试技术架构变化时确定[测试架构](../../contracts/testing-architecture.md)；既有批准方案按版本复用。MA结合SA/已确认UI细化实施级行为、可测试边界、Unit/Integration设计和必要真实依赖，不改变两阶段规格责任。
- Coder依据批准行为采用下述TDD/调试/完成核验；QA独立检查断言、核心任务、异常、权限、恢复、mock边界与真实环境；Reviewer独立评价测试和证据质量。Master协调策略就绪、缺口/版本和统一交付入口，不能替Owner接受成果。

## 深度按风险裁剪

| 工程深度 | 当前需要的工作 |
| --- | --- |
| Lite | 复用测试策略，针对性测试和必要回归，准确结果；不重复架构讨论或全量RTM |
| Standard | 当前AC、必要Functional TC、适用TDD或有理由的等效策略、CI与可追溯报告 |
| Full | 按关键数据/安全/跨模块风险增加真实依赖、并发/恢复及独立验证；故障注入或mutation仅在有价值时采用 |

它与Architecture Profile独立，不免除已触发的安全、Review、测试或授权。当前行为和风险已有足够证据后停止；不为每个微循环创建commit、报告或Agent。

## 分类与测试架构

`types`表达functional或non-functional；`layer`表达unit/component/api/integration/e2e。Functional检验用户目标/规则/可观察结果，可以跨多个层级；Unit不天然等于非功能测试，API也不天然等于E2E。Non-functional按性能、安全、可靠性和恢复等实际风险设计。项目可扩展类型但须定义，层级边界由SA说明。

测试框架、数据隔离、mock与真实依赖、隐私、本地命令、CI、coverage、报告和TDD范围见[十项测试策略](../../contracts/testing-architecture.md)及[模板](../../templates/testing-architecture.md)。Python可用pytest，Java可用JUnit Jupiter/Mockito/Spring Test/JaCoCo，TypeScript可用Vitest/Playwright，.NET可用xUnit/NUnit/MSTest/Coverlet，Go可用testing/go test；仅为参考，均非框架固定依赖。真实PostgreSQL不变量不能用SQLite证明；本轮合成SQLite/文件测试也不证明生产数据库或Spring行为。

## TDD、调试与完成核验

选择性适配固定来源的[Superpowers Lite](../../integrations/superpowers-lite.md)，不安装全套规划/调度/审查流程。

1. 对适用的新行为/缺陷，从批准AC或模块不变量选一个可测行为，先写必要测试，实际运行并确认RED来自预期行为缺失。导入、语法和环境错误不算行为RED。
2. 最小实现使GREEN，必要重构后再跑相关测试。保留代表性命令、退出码、时间和测试/实现版本证据；测试后补不冒称TDD，历史实现不补造RED。
3. 调试先复现，区分观察与根因假设，验证根因，最小修复，补针对性回归并检查影响。局部问题由Coder处理；复杂接口/事务/并发找MA，系统性问题找SA，产品取舍回PA/Owner。不因每次失败额外启动专家。
4. 声明完成前核验当前代码/提交、适用测试、必要静态检查/构建、回归、失败/未测、报告和真实CI。已写测试、预计通过、历史CI均不代替本次结果。Coder核验不替独立QA/Review。

断言使用独立、具体的预期值与实际行为；避免复制实现算法作为expected、只检查mock调用或一律拒绝却漏合法路径。QA按风险加入跨主体、失败恢复或真实依赖反例，保留缺陷复现与同一探针修复后结果。

## 追溯与报告

复用稳定ID，以引用连接`Feature → Requirement/AC → Design → Implementation → TC/Test Function → Run/Result`，支持多对多；不复制规格正文、步骤或结果，不要求每个Unit人工填完整RTM。详见[追溯契约](../../contracts/requirements-traceability.md)。候选需求保留candidate，未经确认不能报告为批准、实现完成或验收。

依[报告契约](../../contracts/test-reporting.md)保留PASS、FAIL、SKIPPED、BLOCKED、NOT_RUN，精确实现/需求/测试定义版本、环境、runner、命令退出码、CI、日志和原始报告。代码line/branch分母与AC分母分开；多对多边不增加测试数，PARTIAL不等于完整AC验证。测试已设计、已自动化、已执行、已通过、AC充分验证、Owner验收是六种不同事实。

统一入口应直达原TC、Unit源码、逐项结果、失败详情、Coverage及CI。项目已有HTML/Allure/JUnit/coverage门户优先复用，不部署统一报告服务。[薄报告CLI](../../scripts/engineering-report.mjs)只消费数据，不执行项目测试，不认证批准/执行真实性。结构有效/退出0不等于验收；全部Unit PASS而Functional NOT_RUN必须保留缺口。测试失败也尽可能上传诊断，但不能吞掉runner退出码。

## 现有项目迁移

1. 项目先批准并固定PADF版本，不由本框架PR自动升级。复用其已有批准测试策略、Catalog/AC/TC、CI和报告，明确当前变更与未采集信息。
2. 按需做已有格式到通用契约的薄映射；schema是新数据格式的声明，不追溯强制旧项目全量填表。历史缺新字段记未采集/NOT_VERIFIED，不据此自动FAIL，也不补造历史TDD。
3. 当前切片补必要Functional场景/版本引用，选代表性运行验证多对多和PARTIAL/FULL，不维护第二份正文/手工结果。不同环境/策略的结果不能拼接完整通过。
4. 在原Design/QA/Review/Owner流程中审查内容；新工具不接入旧G-01为全局强制门禁。若以后改变机器门禁，先提交范围、兼容回归、迁移/回退及必要批准。
5. 回退可停止新适配器/引用，保留原始证据及旧流程。报告不得重写批准/审计历史。

本轮[设计与实际验证入口](../../docs/enhancements/engineering/DESIGN.md)及[合成多栈示例](../../examples/engineering/README.md)与PKMS只读兼容评估分开；.NET、Go和完整Spring未在本轮执行。正式版本、验收、合并与发布另由Owner决定。
