# Engineering Capability Enhancement — 设计提案

建议在现有角色、契约及 Node 薄工具中增量纳入工程测试能力：统一证据语义，由项目选择测试框架。无新服务、执行引擎、角色或审批。本文为 ENG-SA-01 与 ENG-MA-01 的 `DESIGN_PROPOSAL / PROPOSED`，不是 Owner 架构批准或编码授权。

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

## 8. ENG-MA-01：报告与追溯模块增量草案

本节为真实 Module Architect 的 `DESIGN_PROPOSAL / PROPOSED`，复用§1–7，不把SA提议视作新批准系统。本次仅在`6469aba08b4a3c31d4c8030aeeda26d93d493b2e`既有Node离线工具边界内细化规范化报告；不构成正式Module Design COMPLETED、Design Gate或Coder启动依据。任务分派为[ENG-MA-01](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/29#issuecomment-6433308867)；PR30分支`enhancement/engineering-formal-integration`输入head为`1193931f64f7dfac82c249b589da21f589e2dc52`。原MA会话不可用，本会话恢复SA同份方案及QA准备资料后只补接口。Business Feature IDs为空（框架任务N/A），无需UI/API服务/数据库迁移。

### 8.1 最小文件职责与依赖

现有`lib/terminology.mjs`、`lib/architecture-profile.mjs`采用纯函数和小CLI，CI以Node22验证；新增工具沿用ESM/Node内置依赖，不要求Node26专属功能。仓库尚无`schemas/`，因此三个轻量JSON schema放`contracts/engineering/`，避免创建无必要的新顶层目录；§3的`schemas/`仅为候选，以下为本提案确定位置。

| 拟变更位置 | 职责与边界 |
| --- | --- |
| `standards/engineering/README.md` | 唯一共享语义；七角色Skill各加职责与此入口链接，PA/SA/MA/Coder/QA/Reviewer/Master按§1执行，不复制整套标准 |
| `contracts/testing-architecture.md`、`requirements-traceability.md`、`test-reporting.md` | 三份人读契约；对应`contracts/engineering/{testing-architecture,traceability,test-run}.schema.json`，机器结构仅校验形状；跨对象/版本不变量由下述函数校验 |
| `lib/engineering.mjs` | 三契约验证、版本/关系一致性和聚合纯函数；不读文件、不调用runner、不访问网络、不写批准 |
| `scripts/engineering-report.mjs` | 路径/大小边界、读取JSON和原始XML、以固定参数调用Python解析桥、输出JSON/可选HTML；仅数据文件路径，不接收shell/测试命令 |
| `scripts/engineering-junit.py` | Python标准库XML解析薄桥；只读stdin受限XML，stdout结构化suite/case和诊断；不执行XML或读取文件/远程实体 |
| `tests/engineering/`、`examples/engineering/` | Node负例/兼容测试及独立Python/Java合成项目；runner由明确本地/CI步骤执行，报告CLI只消费结果 |

依赖方向：CLI→XML桥/纯函数；纯函数→三个契约数据；摘要→标准JSON。旧Design Gate、G-01/action-preflight机器文件和输入schema不依赖新模块。无需registry、插件接口、数据库、常驻进程或测试执行引擎；将来已有格式确有需求再扩展适配器，本轮只支持JUnit规范化。普通Markdown模板/契约增量引用共享入口；Engineering深度只建议范围，不新增强制审批。

### 8.2 三种输入契约与稳定身份

所有结构含`schema_version`、`context_id`和项目自定稳定ID；引用类型为`{path|url, revision, sha256?}`，仓库源码固定commit，未提交合成版本固定文件内容摘要。工具不得将字段存在等同批准；`approval_ref`是待人工核验来源。如下为最低字段，具体schema须与实现一同提交并由QA用负例核验，不把伪代码当现有API。

| 契约 | 必需字段及约束 |
| --- | --- |
| `padf.testing-architecture/v1` | `strategy_id, project, source_ref, status(PROPOSED/APPROVED), approval_ref|null, stack[{name,version,basis_ref}], profile(Lite/Standard/Full), test_types, test_layers, boundaries[{subject,real_dependencies,mock_boundary,isolation}], commands[{id,argv,purpose}], ci_ref, coverage_policy{metrics,include,exclude,denominator,risk_basis}, reporting, tdd_scope, data_privacy`；命令仅记录，不由本工具执行；旧批准策略只引用精确版本 |
| `padf.traceability/v1` | `trace_id, requirements_revision, test_definition_revision, requirements[{id,feature_ids,kind,approval(candidate/approved),approval_ref,source_ref,required_tc_ids}], test_cases[{id,source_ref,types[],layer,selector?,required_assertions[],preconditions_ref,steps_ref}], nodes[{id,kind(design/implementation),source_ref}], links[{id,from,to,relation,evidence_scope(NONE/PARTIAL/FULL),required_assertion_ids[]}]`；design/implementation节点以固定`source_ref`引用，节点ID和边ID唯一；不得复制原需求/用例正文；同名不是同ID |
| `padf.test-run/v1` | `run_id, repository, source_revision, dirty_tree_digest|null, requirements_revision, test_definition_revision, strategy_ref, runner{name,version}, environment, command{argv,exit_code}, started_at, finished_at, ci_ref|null, raw_reports[{path,sha256}], tests[{result_id,selector,tc_ids,types[],layer,status,attempt,assertion_ids[],evidence_refs[],details}], tc_evidence[], coverage[], diagnostics[]`；状态仅`PASS/FAIL/SKIPPED/BLOCKED/NOT_RUN`，`types`与`layer`独立；coverage每项保留tool/version/metric/covered/total/include/exclude/source_revision/raw_ref，不平均异口径百分比 |

`selector`保留完整框架身份：Python原nodeid（含参数），Java至少engine/class/method及参数或框架uniqueId；JUnit缺完整ID时用报告sha256+suite ancestry+classname+name+ordinal形成**报告局部身份**，不能凭basename/子串自动匹配TC。自动映射只接受manifest中精确的一对一selector对应；歧义必须报错等待显式映射。参数化调用各有result_id；同一次结果关联多TC仍只算一次执行。result_id在一个run唯一；同run重复导入是冲突，不能悄悄overwrite或当两次执行。重试通过`attempt`保留每次原事实，首失败可见；本轮保守以任一失败阻止完整通过，不实现“最终绿覆盖失败”策略。

`source_revision`（被测实现）、`test_definition_revision`（用例/测试代码）、`requirements_revision`（需求/AC）分别匹配。一个git SHA不足以代替三者；无用例代码摘要或所需版本不匹配的结果可展示为历史事实，但不得进入当前覆盖/完整通过分子。脏树以manifest中实际摘要标明，不伪装commit运行；读取JSON不能证明记录是真实运行，原始runner和CI证据仍由QA/Reviewer核验。

### 8.3 最小公共函数与CLI

纯函数输入均不可变，返回新对象；验证统一返回`{valid:boolean, errors:[{code,path,message}], warnings:[]}`，不抛出不透明的首错丢失其余诊断。可预期坏输入产出诊断；CLI文件读取/子进程错误捕获为明确报告错误。

```text
validateTestingArchitecture(strategy) -> Validation
validateTraceability(trace) -> Validation
validateTestRun(run) -> Validation
normalizeJUnit(parsedSuites, manifest) -> {run, diagnostics, valid}
validateEvidence(trace, runs, targetVersions) -> Validation
summarizeEngineering(trace, runs, targetVersions) -> Summary
renderEngineeringHtml(summary) -> string
```

接口数据形状在本提案冻结如下（七个公共函数，不增通用扩展层）：

```text
RunManifest = 除 tests/diagnostics 外的 TestRun 必需元数据
  + selector_map[{report_case_key, selector, tc_ids, types[], layer,
                  assertion_ids[], evidence_refs[]}]
  + tc_evidence[{tc_id,scope(NONE/PARTIAL/FULL),preconditions_verified:boolean,
                 steps_verified:boolean,assertion_ids[],evidence_refs[]}]
ParsedSuites = {suites:[{path:[string], declared_counts:{tests?,failures?,errors?,skipped?},
  cases:[{report_case_key, classname, name, time_seconds?,
          outcome(PASS/FAIL/SKIPPED), details, ordinal}]}], diagnostics:[]}
TargetVersions = {repository, source_revision, dirty_tree_digest|null,
  requirements_revision, test_definition_revision,
  strategy_ref:{id,revision}, environment_id}
```

Python桥输出`ParsedSuites`，`report_case_key`是原始XML SHA256+suite path+case ordinal的精确串；manifest映射以该键匹配并提供原runner稳定selector，不能凭name推测。没有映射的case仍保留原事实及报告局部selector，`tc_ids=[]`/`types=[]`、`layer`由manifest默认层级给定，产生UNMAPPED警告，不能用于任何AC完整覆盖。manifest的`tc_evidence`只记录本次实际执行TC的完整性事实，原样进入run；缺失或无前置/步骤及全部必要断言证据时只能PARTIAL，不能由JUnit case PASS生成FULL。manifest另含`default_layer`与实际`environment.id`，与run环境一致；`assertion_ids`为实际证据声明并由QA核验，不能从空JUnit推定。`raw_reports`必须恰好对应实际输入文件SHA，runner退出码/时间均不可省略。Python桥只输出叶case，一份XML同一报告局部键重复为错误。

例如某case映射`{report_case_key:"sha256:…/suiteA/0",selector:"tests/test_store.py::test_owner[alice]",tc_ids:["TC-1"],types:["functional"],layer:"integration",assertion_ids:["owns-record"],evidence_refs:["raw.xml#case-0"]}`，只提供该实际断言证据；它未涵盖TC其余步骤时仍为PARTIAL。

`Traceability.nodes`只放design/implementation引用节点；requirements与test_cases本身就是可连节点，三集合ID全局唯一；每条`links.from/to`必须精确指向其一，relation为`refines/implements/tests`，方向分别是需求→设计、设计或需求→实现、TC→需求/设计/实现，拒绝不存在节点和反向关系。需求kind可为requirement/ac，feature_ids是项目已有稳定Feature身份引用（不在工具中重建Catalog）。

`TargetVersions`精确限定一次摘要证据组；`source_revision/dirty_tree_digest`、两个定义版本、strategy id+revision、environment_id全部相同才可合并。不同环境/策略的run分组独立显示，禁止求并集凑全FULL；若调用者指定target而输入不符，`validateEvidence`列VERSION_MISMATCH/INCOMPATIBLE_GROUP，CLI退出2，保留历史诊断列表。未给target不自动选“最新”。同组同selector不同run仍保留历史失败，不能PASS覆盖；若失败已修，必须以新源码版本的新target重跑。

`normalizeJUnit`只做格式及显式manifest关联，不接受未解析XML、不臆造批准/需求/coverage。`summarizeEngineering`必须先校验；非法输入输出`valid:false`及诊断，禁止给“全部通过”横幅；有效输入允许未充分验证、FAIL等结果。HTML函数只渲染标准摘要且转义全部动态文本、属性及失败详情，链接仅相对受控报告路径或`https:`，拒绝`javascript:/data:/file:`等协议；源码/CI HTTPS链接须固定版本。长错误正文可截断展示但原artifact保留。

```text
node scripts/engineering-report.mjs normalize --manifest run-manifest.json --junit results.xml --report-root artifacts --out normalized.json
node scripts/engineering-report.mjs summary --trace trace.json --run normalized.json [--run another.json] --versions target-versions.json --report-root artifacts --out summary.json [--html summary.html]
```

固定参数解析拒绝未知/重复单值参数；无shell解释和项目命令执行。`--out/--html`限制报告根内，已有输出拒绝覆盖（调用者选择新run目录）。CLI退出码：0=有效结构且本命令无已知失败/证据错误；1=结构有效但runner退出非0或有FAIL/BLOCKED；2=CLI/解析/契约/版本/路径错误。SKIPPED/NOT_RUN会在摘要显式标为不充分，即使进程0也不代表功能完成。CI必须保留runner原退出状态，并在always步骤上传报告；报告步骤0不能覆盖runner失败。工具无OwnerAcceptance参数或写批准动作。

### 8.4 聚合算法与失败语义

1. 先校验唯一ID、引用存在和枚举；`required_tc_ids`不得空集自动全通过，空需求分母显示`N/A(no approved current scope)`。candidate独立列表，不进入批准当前需求分母；批准来源缺失为契约错误。
2. 当前执行以`(run_id,result_id)`去重，关系以稳定边ID去重；重复键冲突是错误，不能通过Set静默隐藏。执行计数是唯一结果数；TC计数是唯一TC数；AC覆盖分母是唯一当前批准AC数，均不能按多对多边数累加。
3. 确定准确三版本后，按每TC要求的前置/步骤/断言和证据完整性评价。执行PASS仅是已运行原事实；TC `FULL`必须明确覆盖全部必要断言/步骤且关联边标FULL、运行及原始证据有效。PARTIAL PASS可展示技术证据，不能升级FULL。测试关联到多个AC时分别核查该AC全部必需TC，不能把单一技术PASS分摊成完整AC。
4. TC执行/验证状态分开保留。当前有效证据任一FAIL→FAIL；无FAIL但有必要BLOCKED→BLOCKED；全部必要范围有FULL有效PASS才给完整PASS；其余列SKIPPED或NOT_RUN并显示缺口（同时保留已执行的局部PASS）。所有原结果及数量仍可见，优先级不是丢弃其他事实的依据。
5. AC只有全部必要TC完整通过且无未解决失败/阻塞才计完整验证；分别输出`designCoverage, automationCoverage, executionCoverage, partialPass, fullPass, gaps, candidateScope`。自动化是存在可定位测试，不等于已执行；执行覆盖分子仅实际有效PASS/FAIL结果，SKIPPED/BLOCKED/NOT_RUN另列，不冒充运行覆盖。
6. `owner_acceptance`始终为外部事实`NOT_ASSESSED`或固定Owner来源的引用，绝不由测试计算。Feature摘要标“验证充分/不充分”和已知失败，不输出自动ACCEPTED/DONE。同一目标不同版本不混合；多次运行即使同版本也不能跨不同环境/策略凑齐不兼容的证据。

JUnit解析接受`testsuites/testsuite`嵌套与`testsuite`根并递归保留ancestry，仅叶`testcase`生成结果；failure/error→FAIL，skipped→SKIPPED，其余仅在有效case及manifest运行证据下PASS。suite计数仅交叉核验，不能相加重复算子suite。无case、空文件、缺文件、错误XML、截断、suite计数矛盾、重复输入XML/重复case身份均生成可定位诊断并非0，不生成空绿run；有非0runner而无失败case也必须保留运行失败诊断，不能全PASS。

XML读取最大10MiB、最多100000个case、最大suite深度64；超限报INPUT_LIMIT不解析部分当成功。解析前拒绝DOCTYPE/ENTITY（含编码变体；仅允许UTF-8/UTF-8 BOM输入），Python `xml.etree.ElementTree`不启用外部实体/XInclude，不进行网络/DTD读取，捕获ParseError。用固定Python可执行路径/argv和有界stdin/stdout/超时调用，不拼shell；桥不可用为BLOCKED/非0。诊断不回显密钥或整个XML。所有输入/输出artifact路径先`realpath`检查在`report-root`之内，拒绝绝对外部路径、`..`逃逸、symlink逃逸；不跟随不可信外链或打开源码中的任意路径。无数据库事务：每次运行独立目录，输出先同目录临时文件、完整写入后原子发布；并发同名拒绝，失败清理仅自己创建的临时文件。

### 8.5 实测接缝与兼容执行要求

本节与QA独立准备的`qa-work/TEST-CASES.md`（工作区外待Master归档）逐项对齐，未代QA执行。新增用例应验证公开行为，不只镜像实现；原始报告、标准JSON、摘要和失败详情可由同一入口回查。

| 验证 | 实现者必须留下的可观察证据 |
| --- | --- |
| Python | 实际Python3.12.0隔离venv；pytest + sqlite3真实临时数据库（事务/跨owner隔离），unit与functional/integration正交；覆盖包含零命中文件和line/branch分母；先实际断言RED再GREEN，命令、退出码、每阶段文件摘要固定 |
| Java | 实际JDK17编译；JUnit Jupiter console standalone1.11.4；真实临时目录写入/读取/隔离的filesystemIntegration及JaCoCo0.8.12 agent+cli line/branch统计；XML→标准JSON/RTM复用；不声称Maven、Spring或数据库集成已执行。jar来源/实际sha256在实现报告锁定 |
| 高风险 | 合成权限/完整性规则：只有同owner可读写记录；未授权请求不改变记录，授权合法操作成功，失败事务保持原值。weakfix如“一律拒绝”必须被真实合法操作断言击穿，或只检caller不检record-owner被跨主体断言击穿；保存实际FAIL，修正后同独立探针PASS。QA探针及结论不由Coder代写 |
| 不完整覆盖/安全 | unit绿但Functional NOT_RUN、PARTIAL映射、candidate、FAIL+PASS、SKIPPED、BLOCKED、错三版本、多对多、重复ID/参数化、未知TC、空/坏/嵌套JUnit、DTD/ENTITY、HTML注入、路径/symlink逃逸；分别核对非绿诊断及完整AC分子 |
| 兼容 | 运行现有CI所列结构、CACF、v0.3全部入口、profile/terminology及diagram source检查；旧门禁字节/哈希对比baseline；既有输入无opt-in不增加字段要求；新模块/新tests加CI步骤，不把报告摘要接入G-01硬阻断 |

Python/Java依赖由Master已准备的`python-env/`、`dependencies/`固定来源消费，不由本任务安装服务。具体可执行版本和jar hash必须实测，不从可读取文件推定测试已运行。Superpowers三方法按§5就地轻量引用；本轮只需代表性RED/GREEN/根因与完成核验记录，不为每次微循环新建Agent、报告、审批或commit。

### 8.6 必要模块图与交付状态

必要图为Architecture/Component、`doc-wide`、6节点：项目外部runner报告+显式manifest → 受限CLI/XML桥 → 规范化JSON → 校验/追溯聚合 → HTML/JSON阅读入口，需求/TC关系源输入聚合。图仅表达报告数据流，不画成自动测试/批准执行引擎；三版本、失败与缺口由边标签/说明保留。图语义源`engineering-report.model.json`与本节同版本；固定diagram-design根Skill SHA256已核验`1b30bb3c0da29a05e5b05c0a4510ce6f286a0d0f1da97b9aa6aaf03c92e98618`（对应lock commit）。图已按Master转达的Owner历史原话“批准 system 提案，采用默认风格”复用默认light及`examples/architecture-method/VISUAL-STYLE.md` tokens，未修改已安装Skill/Profile。实际HTML/模型/PNG为`engineering-report.{html,model.json,png}`，验证记录`diagram-validation.json`。锁定Skill self_check与六节点/五边一致性检查PASS；Master使用窄授权、独立临时profile实际Chrome156.0.8078.48 / Playwright1.62.1渲染，04:06:28Z宽viewport重跑PASS（零远程请求/页面错误/文字溢出/标签节点碰撞；390px页面无横向溢出且局部滚动）。实际名称字体为系统PingFang SC，未假称加载Geist。MA实际打开最终PNG核对六组件完整可见、五条方向与职责相符、无执行/批准含义；首次PNG因viewport裁切被拒绝，修正导出后复验。图生成/渲染/内容检查均PASS，仅验证设计资产，不验证产品测试。

本MA只交设计草案：工具代码、三schema、新案例运行、旧回归、独立DESIGN review、Master依赖协调及Owner适用决定均未由本会话执行。若必需图未真实渲染，模块图状态NOT_RUN，正式Module Design仍不完成；Master可据草案继续已授权的设计补齐/审查，不由本节放行Coder。
