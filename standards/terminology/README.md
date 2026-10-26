# 按语境使用术语

本目录提供六领域的通用词表候选和按需检查方法。新增词条均为 **PROPOSED**，待 Owner 对本次 PADF 候选明确接受；它们不继承 PKMS 项目词条的 ACCEPTED 状态，也不改写现有 PADF 契约效力。这里不新增 Agent 角色、执行阶段或术语审批流程。

只读当前任务相关段落、必要上下文和对应领域词条。普通文档小改不先建立项目词表，不默认扫描整个仓库。成熟且自然的中文优先；易混淆专业词首次写“中文（English）”，通行英文和技术标识符可保留。用具体主体和动词表达动作；正确专业词解释不足时补解释，不一律换成日常词。写作原则参照 [Microsoft Style Guide](https://learn.microsoft.com/en-us/style-guide/word-choice/use-simple-words-concise-sentences)，中文为 PADF 建议，未核验正式中文译文。

## 找到需要的内容

| 当前问题 | 加载领域 | 核对的权威材料 |
| --- | --- | --- |
| 用户意图、功能、规则和验收 | `ProductAndRequirements` | 当前高层规格、Catalog及产品决定 |
| 范围、阶段计划、依赖与风险 | `ProjectManagement` | 当前Task Contract和实施计划 |
| 层级、模块、视图、ADR及来源 | `Architecture` | 系统/模块设计及稳定节点ID |
| 接口、重试、消息或程序概念 | `Engineering` | API/Schema/代码与行为契约 |
| Agent、模型、检索及评估 | `AI` | 当前AI能力、数据/工具权限和评估依据 |
| Task、Handoff、Review、批准与基线 | `PADF_Governance` | 当前PADF契约及准确批准记录 |

[GLOSSARY.yaml](GLOSSARY.yaml) 是词条与引用元数据的唯一数据源；可直接 `JSON.parse`，内容属于 YAML 1.2 的 JSON 子集，不新增运行依赖。人阅读版本只能由它生成，勿独立编辑定义。[共享 Skill](../../.agents/skills/terminology-governance/SKILL.md)用于实际检查；[Before/After](BEFORE-AFTER.md)解释少量真实短句及正反例；[SOURCES](SOURCES.md)说明本轮访问范围与限制。

## 范围按需选择

| 模式 | 读取与交付 |
| --- | --- |
| Lite | 单段、标题或少量标签，加必要上下文与有关词条；给简短建议和意义核对即可。 |
| Standard | 明确列出的一组相关产品/设计页面、相应词条及关联图标签；按实际发现记录位置和建议。 |
| Full | 已授权的跨文档治理；先列页面和版本，再对齐产品、系统、模块、接口与图表，记录冲突和限制。 |

Full 不自动扩展任务授权。发现范围外问题只指出具体来源/责任，继续有界工作。任何模式都沿现有 Review/Owner 路由，不为普通措辞增加审批。

## 项目覆盖和冲突

项目可以在自身现有词表或规格中定义专属概念与局部显示词，记录 `term_kind: project`、领域/上下文、定义、维护责任、准确来源/版本和真实状态；按需引用 PADF `term_id`，不修改 PADF 原词条或伪造通用批准。例如项目可明确自己的“知识片段”是何种证据实体；PADF 通用词条不要求其采用任何项目的字段或生命周期。

先辨别是否同一个概念。不同领域同名可并存，用限定词及上下文区分；同一概念的显示词按已确认项目词义使用。项目词义可细化业务含义，但不能覆盖已批准产品规则、技术不变量、API/Schema/类/数据库字段、稳定ID、SHA、枚举或机器契约字段，也不能覆盖 PADF 的权限和审批语义。

若项目词表与已批准规格、技术契约或当前PADF治理发生实质冲突，保留原权威规则并停止受影响替换，向 Master 指出双方精确位置/版本和实际差异：产品含义回 PA/Owner，技术含义回 SA/Module，权限/重大决定按原批准路由。不得按“新文件优先”、词表状态或个人偏好静默择一。历史ADR、批准及执行/审查记录保留原文；语言候选放对照，不能倒改历史事实。

## 单源字段与状态

根对象包含 `schema_version: padf.terminology/v1`、`status`、`domains`、`sources`、`terms`。领域枚举见上表。`sources` 的 `reference_id` 唯一，包含 `title/url/source_class/verified_scope/observed_at/access_limitations`；每条 `reference` 为引用ID数组。`observed_at` 是本轮实际观察日期，不代表抓取快照或该来源的批准时间。

词条保持稳定 `term_id`，包含 `english_term/preferred_zh/definition/domain/allowed_aliases/discouraged_terms/usage_example/reference/status`；`term_kind` 取 `general/padf_governance/project`，`definition_basis` 取 `industry_usage/framework_definition/project_definition`，`zh_translation_status` 当前为 `padf_recommended`，`verified_scope` 说明可声称范围。本轮不提供 `formal_standard` 全文定义类别：公开摘要、索引或行业转述不能冒充已取得标准正文。项目覆盖不是新机器协议，这些字段仅为词表元数据。

`PROPOSED` 是建议，`ACCEPTED` 仅在相应Owner实际接受该范围/版本后更新；`DEPRECATED` 保留ID并说明原因及替代项。词条接受、设计批准、Review通过、编码授权、CI、合并、发布与部署分别核验。词条状态不改变它引用的产品/技术提案状态。

`allowed_aliases` 只在相同概念和所注明语境中可互用；`discouraged_terms` 是带条件的审查提醒，不是禁词或全局替换表。“消费者”“闭包”“模型漂移”“收敛”“接缝”在准确的专业语境可以保留。

## 保护与验证

自动检查可核对词表结构、领域、唯一ID、引用存在及生成版一致性，也可提示代码块/行内标识或受保护文本发生变化；它不能证明语义等价、批准真实或理解效果。术语改写必须人工逐句核对主体、对象、条件、否定、范围、关系/方向、顺序、数据权威、模块责任、权限、错误/恢复与准确状态。禁止按命中词面执行全仓替换。

API、Schema、类名、数据库字段、Feature/ADR ID、SHA、状态枚举和机器字段改名需要独立兼容性分析及相应变更授权；权限、数据权威、错误/恢复、ADR决定及历史批准也不能借润色改变。图标签按稳定ID对齐正文及层级；显示名称变化仍需核对模型/关系，若确需改图，按项目固定绘图工具实际渲染并验证，未执行记 NOT RUN。

## 有界的本地辅助工具

- 生成[阅读版](GLOSSARY.md)：`node scripts/build-glossary.mjs`；CI 用 `--check` 检查单源同步。
- 只检查指定页面和领域：`node scripts/check-terminology.mjs Engineering,AI selected.md`。条件性短语仅提示结合语境审查；不扫描目录、不改文件。未命中也不表示用词全部正确。
- 对比指定前后文件：`node scripts/check-terminology.mjs Architecture --compare before.md after.md`。保护常见Markdown代码、API、完整SHA、Feature/ADR ID和状态；库函数另支持显式保护词和历史全文冻结。结构变化使对比失败，未检测到变化仍须核对语义、权限和恢复；结果始终 `semantic_status: NOT_VERIFIED`。

辅助器不负责项目词表的自动合并；项目覆盖按上方冲突规则由负责角色核对。机器保护只覆盖已列形式，其他标识显式指定或按Schema/契约进行实际diff，不能把正则结果当完整兼容性证明。
