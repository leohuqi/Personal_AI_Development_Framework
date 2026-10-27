# ENG-QA-01：框架验证输入

本任务为 PADF Engineering Formal Integration（Issue29），基线 `6469aba08b4a3c31d4c8030aeeda26d93d493b2e`。当前仅准备需求侧用例，架构/API尚未冻结；所有新实现验证为 **NOT_RUN**。原Progress修复PR28不在本任务基线，旧任务授权/结果不继承。

| 场景 | 输入与执行 | 独立可观察预期 |
| --- | --- | --- |
| A1 Python测试架构 | SA选择pytest及实际项目适用层级，给定同一功能可跨层的Functional TC | 策略可复用；Functional为类型，unit/component/integration/e2e为层级；未适用层级明确理由 |
| A2 真实Python RED/GREEN | 对批准行为先运行pytest失败断言，再最小修复和复跑；保留命令/环境/源摘要 | RED因目标行为缺失；语法/导入/依赖失败不能冒充RED；GREEN实际通过，不补造历史TDD |
| A3 报告与真实依赖 | 实际pytest执行JUnit/coverage，集成场景只使用独立合成数据与批准的真实依赖 | 可读原始逐测试结果与失败详情，line/branch分母包含零命中模块；mock不冒充真实依赖 |
| B1 跨语言选择 | Java/JDK17项目采用JUnit Jupiter或说明理由的等价方案；不依赖pytest | 实际编译/执行Java测试并产生可归一结果；是否使用Spring Test如实说明；工具缺失=BLOCKED/NOT_RUN |
| B2 格式等价 | Python JUnit XML与Java JUnit XML/等价格式分别输入共用报告契约 | test/run/环境/版本/日志/状态语义一致；框架名称开放，不写死pytest/PKMS IDs；不新建通用执行引擎 |
| C1 弱权限/完整性修复 | 根据MA当前明确不变量，实际复现弱实现；独立QA用遗漏的正常/跨主体/错误路径击穿薄弱修复 | 不能因现有单测全绿而PASS高风险行为；复现、根因、必要升级与针对性回归有实际证据 |
| C2 最小有效修复 | 对相同独立探针运行修复后实现及必要相关回归 | 原失败转PASS，同时合法行为未被“一律拒绝”等弱修复破坏；QA不自行修实现 |
| D1 全部Unit PASS但Functional未执行 | 同一Feature存在当前重要AC及设计好的Functional TC，Unit/代码Coverage全绿，FT=NOT_RUN | 报告显式未测与不足，不能宣称完整AC/Feature完成，更不能OwnerAcceptance |
| D2 部分关联与候选需求 | 一个技术测试关联多个AC/TC，另有PROPOSED候选AC、SKIPPED/BLOCKED/FAIL | 不按RTM边数重复计数执行；PARTIAL不升级FULL；候选不变批准；失败/阻塞不被其他PASS覆盖 |
| D3 错版本及缺失报告 | 测试结果为旧SHA/旧TC revision/旧测试代码；或本轮日志/XML缺失/空集合 | 明确过期或NOT_RUN/失败，不用历史CI或进程退出0补PASS；逐结果能回查准确测试代码和被测版本 |
| D4 精确映射 | 多对多Feature/AC/design/implementation/TC/run；同名不同selector/重复结果ID/未知TC | 通过稳定ID和完整selector链接；冲突/未知映射可见，不能子串匹配或默默归给另一需求 |
| E1 旧Gate兼容 | 运行既有Design/G01/Owner/角色分工回归，原有效输入未启用新规范 | 不全局强加新字段，不把历史项目判失败；工程结果只增强原评价，不新建第二审批/门禁 |
| E2 Profile与授权 | Lite复用既有策略；Standard当前AC；Full按安全风险增加必要证据 | 深度裁剪不豁免已触发安全/QA/独立Review/Owner授权；Engineering与Architecture Profile分别表达 |
| 报告失败传播 | 实际测试失败仍生成可读诊断并保留artifact；解析异常/缺报告独立列出 | 上传报告不吞失败exit；summary能定位源码/用例/逐测试报告/coverage/CI和剩余风险 |
| Superpowers Lite成本 | 核对仅TDD、debugging、completion verification三方法的固定来源/许可/适配 | 不增加重复规划/调度/Review/审批，不要求逐微步commit或报告；仅给实际观察的开销结论 |

执行时以冻结API补最小独立行为探针，优先上述实际风险，不以用例数为目标。Python/Java运行、必要CLI下载及真实测试依赖在获授权隔离环境执行；项目私有数据、NAS、PKMS代码和真实任务保持只读。被测SHA或内容哈希、测试版本、环境、命令和结果必须实际记录；准备文档不是测试通过证据。
