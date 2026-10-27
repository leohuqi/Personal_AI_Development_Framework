# Engineering Capability Enhancement — 设计提案

建议在现有角色、契约及 Node 薄工具中增量纳入工程测试能力：统一证据语义，由项目选择测试框架。无新服务、执行引擎、角色或审批。本文为 ENG-SA-01 的 `DESIGN_PROPOSAL / PROPOSED`，不是 Owner 架构批准或编码授权。

- 任务：[Issue #29](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/29)，事前分派 comment `6433041920`；Owner 原始指令由 Master 固定引用。
- `system_baseline_ref`：PADF main/v0.3.6 `6469aba08b4a3c31d4c8030aeeda26d93d493b2e`；本工作目录是该版本源快照，无 `.git`，不可声称本地 Git 核验通过。
- 既有权威：[Solution Architecture](../../../contracts/solution-architecture.md)、[角色交付](../../../contracts/role-deliverables.md)、[两阶段规格](../../../contracts/product-definition.md)、[Design Gate](../../../contracts/design-gate.md)、[G-01](../../../workflow/action-preflight.md)。未合并 PR #28 的 Progress 修复不纳入。
- 本次复杂度 `High`：跨七角色/契约的状态语义、JUnit 差异和兼容回归；不是新增平台。MA 补本文件模块接口及一张必要图，设计审查/依赖协调沿用现有路径。

## 1. 系统边界与责任

PADF 仍是通用开发框架；应用测试由项目 runner 执行。框架只定义测试架构、关系和报告契约，并提供离线校验、成熟格式适配与派生摘要。真实代码、规格、CI 和原始报告保持权威，摘要不复制它们。

| 责任方 | 适用增量及边界 |
| --- | --- |
| PA | 在 Catalog/高层规格提供稳定 Feature/AC、业务规则及正常/异常/权限场景；候选发现保留未批准身份 |
| SA | 新系统/测试架构变化时决定 Testing Architecture；旧项目复用精确批准策略，只补差异 |
| MA | 在系统策略内细化可测试边界、模块不变量、依赖及 unit/component/integration 设计；不重选应用栈 |
| Coder | 依据批准 AC/模块规则实施适用 TDD、局部调试及当前版本验证；不代 QA/Reviewer |
| QA | 需求形成时分析场景，当前切片编码前细化功能用例；独立执行、评估环境与完整 AC 证据 |
| Reviewer | 独立核验行为断言、mock 边界、真实风险、追溯和精确版本；不替 QA 真实执行 |
| Master | 复用既有分派/收件，协调策略就绪、证据/RTM缺口及交付；不批准风险或推定 Owner 验收 |

## 2. Testing Architecture 与跨栈策略

项目策略必须覆盖：框架/版本依据、层级/测试对象、mock/fixture/真实依赖与隔离、合成数据和隐私、本地命令、CI、coverage分母/风险要求、报告入口和TDD范围。选择满足当前风险的最简单方案；不设无测量依据的统一百分比或唯一工具。

| 技术栈 | 可选项目方案（示例，非 PADF 强制依赖） |
| --- | --- |
| Python | pytest；按需 pytest-cov/现有报告器 |
| Java / Spring | JUnit Jupiter；按实际边界选择 Mockito、Spring Test、JaCoCo |
| TypeScript / Vue | Vitest；完整用户流程按需 Playwright |
| .NET | xUnit/NUnit/MSTest；按需 Coverlet |
| Go | testing/go test；适配原生结果或成熟 JUnit 转换器 |

Unit 验证局部算法和不变量；Component/API 验证真实组件/协议；Integration 验证数据库、文件、消息等真实边界；E2E 验证完整用户流程。Functional 是业务结果测试类型，可横跨层级；性能、安全、恢复等 Non-functional 类型按风险配置，不能与层级机械互斥。

Mock 只隔离明确外部边界，不能将 mock 交互当核心业务结果；事务/授权/恢复须有适用真实依赖证据。每次运行使用独立合成数据/临时目录，不读取私有库或生产数据；日志、截图、XML/HTML不得含密钥、票据或原件。浏览器遵循宿主批准及独立 profile 规则，启动失败不算页面断言失败或通过。

Lite 复用策略、针对性测试及必要回归；Standard 覆盖当前批准 AC、功能测试、TDD或说明理由的等效策略及追溯报告；Full 根据高风险增加真实依赖、并发、故障/恢复证据。它们独立于 Architecture Profile，不豁免既有安全/审查/授权。

## 3. 交付结构与接口方向

优先增强七个现有 Skill、既有产品/架构/交付契约及 QA 模板；`standards/engineering/README.md` 作为唯一共享语义入口。新增轻量 Testing Architecture、RTM、Test Reporting 契约及必要 JSON schema 由该入口链接，不新建 engineering-quality Agent/重复 Skill。

建议结构：`standards/engineering/` 维护规范与固定上游归属；`contracts/` 维护正式契约；`schemas/` 按仓库既有约定保存机器格式；`lib/` 与 `scripts/` 提供 Node 内置依赖离线适配/校验/摘要；`tests/` 和 `examples/engineering/` 放真实边界验证与可复现样例。Python 只作为已有薄工具/pytest案例依赖；不为 XML 建自制通用解析引擎，优先成熟解析器或现有 Python XML 标准库薄桥接。

输入流为“项目规格/用例与轻量关联元数据 + runner原始报告 + 精确版本运行清单”；适配层输出标准JSON；校验/RTM层读取同一JSON并生成可审阅摘要。工具不启动任意项目测试命令、不执行代码片段、不读取远程引用、不产生批准。具体模块API/文件名由MA细化。

Test Run至少含 schema版本、唯一run ID、仓库/准确SHA（dirty须另记工作树摘要）、CI/run/ref、工具/环境/命令/退出码/时间、层级/对象、逐测试稳定selector/TC关联、状态、错误/日志/原始报告及适用coverage。测试结果中的源码和报告链接应固定版本；路径限制于允许的报告根，禁止XML外部实体、路径穿越及HTML注入。

JUnit是优先输入而非唯一格式；支持`testsuite/testsuites`、嵌套suite、failure/error/skipped、重复/参数化selector、空/缺失/损坏/截断报告及不同工具计数约定。解析失败必须可诊断，不能空结果PASS。JUnit没有表达的BLOCKED/NOT_RUN、需求批准与完整验证语义必须来自明确manifest/用例证据，不能从XML臆造。

## 4. 追溯、状态与质量不变量

RTM只保存稳定ID、关系和来源引用，不重复需求正文、步骤或运行结果：`Feature ↔ Requirement/AC ↔ Design ↔ Implementation ↔ TC/Test Function ↔ Run/Result` 支持多对多。Unit可用稳定selector关联模块规则/不变量，不强迫逐项人工填写完整业务RTM。

- 批准身份（candidate/approved及其来源）、设计/自动化状态、执行状态、完整验证状态、Owner验收分别保存。候选可有探索性测试结果，但不能报告已批准、正式实现或验收。
- 执行枚举为 `PASS/FAIL/SKIPPED/BLOCKED/NOT_RUN`；不适用范围显式排除并给理由，不计通过。旧显示 `NOT RUN` 可映射 `NOT_RUN`，不能改变事实。
- PASS仅来自实际有效运行；SKIPPED不是PASS，缺运行/缺报告不是零测试成功。FAIL/BLOCKED不能被同一目标的其他PASS冲淡。
- 精确selector、源码/用例版本、环境与被测SHA必须可回溯；不同SHA不能合并为同一验证；旧证据保留原SHA，只能明确说明适用性复用，不伪装重跑。
- 完整TC需要必要步骤、前置/数据、可观察断言和准确证据全部满足；AC完整验证依赖其全部必要功能用例/风险范围，局部技术PASS单列。任何映射、自动化或31个Unit PASS均不能推出AC/Feature完成。
- Requirements Coverage按明确批准的当前分母，分别展示设计、自动化、执行、局部/完整通过及缺口；candidate/未来范围另列。Code Coverage分列line/branch等工具原生指标、include/exclude和分母，不能平均不同测量口径或替代AC覆盖。
- 重复run/参数化用例不可静默覆盖；retry保留失败尝试及最终策略。测试失败仍尽可能保存报告，上传成功不得把原测试退出码改绿。

有意义交付从Delivery Report直达Test Cases、测试源码@SHA、逐项结果、失败详情、coverage与CI原始artifact；轻量Markdown/HTML可由标准JSON派生，不新增报告服务。来源不可读、环境不足、结果过期或完整范围未测须显式列为缺口，由QA/Reviewer判断影响。

## 5. Superpowers Lite 适配

固定 `obra/superpowers@2ce8aa15d05bd57213e6f746f953aafb7ded7a8b` 的三个方法及被引用的`writing-good-tests`。MIT归属保留 Jesse Vincent 2025版权、许可全文及固定源路径/采用差异，不直接覆盖原始Skill，不引入其他规划/调度/审查方法。当前依据是固定资料阅读，不是这些方法已通过项目实测。

- TDD：批准行为/规则→必要测试→实际预期行为缺失RED（非导入/环境错误）→最小GREEN→必要重构和相关回归。记录代表性命令/退出码、预期失败、测试/代码摘要及时间；测试后补不得冒称TDD，历史过程标NOT_VERIFIED。
- 调试：复现/观察与假设分开→根因证据→最小修复→针对性回归与影响验证。Coder局部处理，复杂接口/事务/并发找MA，系统策略找SA，Master仅协调；不按每次失败额外启动角色。
- 完成前核验：当前代码/版本、适用测试、必要静态检查/构建、影响回归、失败与未测、报告和CI。不能拿已写测试、预计通过或历史CI代替真实结果。
- PADF差异：不删除历史实现重造RED、不强制每微步骤全仓测试/独立提交/报告、不增加异常审批或第四次修复自动审批；按项目策略及风险选择验证范围。重大变更仍走原授权，适用全套回归在交付前执行，已知失败全部报告。有效断言检查真实行为，避免照抄实现或只断言mock。

## 6. 验证计划、兼容与风险

| 案例 | 必须真实验证及不可越界的结论 |
| --- | --- |
| A Python | 本机pytest 8.4.2；功能类型/层级、预期RED/GREEN、运行报告、code/AC覆盖、RTM和完成前核验；精确记录实际环境与依赖 |
| B Java | JDK17 + 固定版本/校验和JUnit Jupiter console standalone（Maven当前不可用）；真实编译/断言/XML→统一JSON/RTM；不声称已验证Spring运行时 |
| C 高风险缺陷 | 合成权限/数据完整性缺陷复现、根因、真实回归；注入薄弱证据让独立QA/Reviewer发现，不能由Coder自称独立审查 |
| D 不完整覆盖 | Unit全PASS但功能AC未执行、candidate、局部/完整、错SHA/缺结果等负例，输出仍显示未充分验证且Owner待验收 |
| E 兼容 | 运行现有框架/Design Gate/G-01回归与新增契约/适配/RTM测试；精确比较原门禁文件及旧输入路径，记录真实失败/未运行 |

五案例在本设计阶段均为`NOT_RUN`，执行者记录结果后才可更新。Node26为当前可用环境；.NET/Go/完整Spring仅契约适用示例，不冒充本轮实测。JUnit方言、缺证据误报、过度mock和旧项目被追溯失败是主要风险，以上负例与独立验证用于控制。

PKMS只读观察基线：`leohuqi/Personal-Knowledge-Library` PR#10 head `efd0aa0faf0583a25048b9869288fff529278152`、main前缀`23c40d4`。现有pytest/Vitest/Playwright、JSON/JUnit/coverage、稳定RTM和HTML入口应作兼容映射，保留项目字段/版本、原始步骤及历史事实；不得把其当前工具版本强加PADF。pilot工程机制已实现/待Owner，完整16AC/32TC仍NOT_RUN；局部通过不能升级业务验收。实际接入、项目改码、合并、NAS测试与部署不在本授权内。

迁移采用显式opt-in和项目锁定：旧任务/规格/QA表继续有效；历史没有新字段记“未采集/NOT_VERIFIED”，不自动判FAIL。先映射已有ID/报告，当前变更才补策略及必要关联，不重排历史测试、不补造TDD。回退可撤去薄工具/新规范引用而保留原报告和原授权语义。预期保持DesignGate/G-01/action-preflight字节不变；如实现需新增强制机器阻断，先停依赖变更并提交兼容分析、自动回归与迁移范围，走原政策。

## 7. Owner交付A–H映射与后续

| 交付 | 本设计约束/下游成果 |
| --- | --- |
| A Engineering Standard | §2–5共享入口与轻量风险裁剪 |
| B Core Skills | §1七角色增量，引用共享规则，保留现有审批 |
| C Testing Architecture Contract | §2项目自主选栈、十项策略及旧基线复用 |
| D Traceability | §4多对多、候选批准、局部完整及精确版本 |
| E Superpowers Lite | §5固定来源/MIT/适配差异及真实证据 |
| F Reporting Contract | §3–4标准JSON、成熟JUnit适配、原始报告导航 |
| G Framework/Pilot Results | §6五案例真实执行与PKMS只读兼容分开报告 |
| H Review/Migration | §6增量opt-in、独立DESIGN/实现审查与原Owner边界 |

下一步由Master收件并协调MA增量细化，独立DESIGN审查与适用Owner决定仍待完成。本文不发出START_CODING许可；最终目标仍为IMPLEMENTED→TESTED→INDEPENDENTLY_REVIEWED→PENDING_OWNER_ACCEPTANCE，合并/发布另行授权。
