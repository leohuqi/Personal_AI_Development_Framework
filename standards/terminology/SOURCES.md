# 本轮来源范围

2026-10-26，Product Analyst 为 PADF vNext 通用化术语方法实际查阅一手资料。逐项 URL、用途、观察日期和访问限制只维护在 [GLOSSARY.yaml](GLOSSARY.yaml) 的 `sources`；本页不重复词条定义。引用支持的是其实际读取范围，不代表通读全部标准或核验了正式中文。TOGAF、ISO和SWEBOK的范围资料可帮助分类，但不能为未读定义背书。

| 领域 | 本轮可采用的材料 | 明确限制 |
| --- | --- | --- |
| 产品/需求、项目管理 | PMI官方索引中的v5.0需求条目、官方Benefits Framework验收条件条目、PMI里程碑实践说明；PADF当前规格/计划契约 | PMI Lexicon入口超时、PDF直接403；没有读取PMBOK/PMP付费全文。范围/风险/迭代等PADF工作释义标framework_definition，不冒充PMI正式定义。 |
| 架构 | C4 Container/Component正文、arc42 §5/§9、Fowler限界上下文、ISO 42010摘要 | TOGAF介绍只可读官方检索内容，官网403、definitions正文跳登录；ISO只读公开摘要，没有全文符合性声明。DDD作者说明不等于读完Evans书。 |
| 工程 | RFC9110 §9.2.2、Richardson outbox模式正文、MDN闭包、PADF接口/设计契约 | SWEBOK只可读IEEE官方检索介绍/目录和v4.0a说明，资源/v4入口403；没有把目录当Guide正文。 |
| AI | Anthropic Agent/Workflow/工具正文、Agent Skills公开格式、Google ML对应条目、RAG/MATH作者摘要、Microsoft/Elastic/Google一手工程说明、Hugging Face评估说明、W3C Annotation入口 | 厂商分类不是唯一行业分类；论文仅读摘要，未复现实验；ISO22989只读摘要；NIST仅读聚合词表使用说明，未取得AI600-1正文，不据未读条目定义Agent。 |
| 写作与PADF治理 | Microsoft清晰用词正文；准确main基线的Task/Handoff/Dispatch/Gate/Approval/产品契约 | Microsoft Learn页头虽有authorization提示，所引正文实际可读。只解释既有权限，词表不签发批准。 |

PKMS输入为Pilot/Refinement main `f22286701db4f4946922972eb116ef893beef430` 和Terminology PR7 `343a3ecdd22a3406ef6721e7478d14a3bdf00c45`。实际读了术语规范、完整54词条、AI指南、Before/After、Evaluation、Skill草案及其reference、PA/SA来源与案例、独立初审/复审和项目接受记录；另核对实际短句所在页与PRD中片段含义。详细输入范围留在本轮Handoff，不复制私人项目全文、业务约束或审计包到PADF。

PKMS已获项目范围术语接受，PR7尚未合并，系统技术仍PROPOSED；历史Reviewer报告中的当时PENDING状态照原样保留。该接受不构成PADF通用定义批准。本轮只复用语境判断、单源、来源限定和技术保护方法，例子仅保留可安全通用的短语。

尚未验证：跨项目实际成本收益、真实Owner/客户理解率、阅读速度、Token/时间改善、模型/产品行为、部署或安全性能。资料阅读是OFFICIAL_SOURCE，推荐和语义对照是专家判断；没有真实参与者的方法记录就不是USER_RESEARCH。Skill文件存在也不证明外部工具已经执行。

## 当前来源状态补充

Master实时REST核验PKMS术语PR7已于2026-10-26 04:17:33 UTC合并，main为`23c40d445ceb8a2db01d68065e3ee351b3c44449`。固定研究输入head `343a3ecdd22a3406ef6721e7478d14a3bdf00c45`与合并提交compare为0文件差异，原专业分析不变；早期“未合并”记录不代表当前状态。项目词条已接受不授予PADF通用词条或系统技术批准，详见[执行增量](../../docs/upgrades/architecture-terminology-vnext/EXECUTION.md)。
