# 通用术语阅读版

由 `node scripts/build-glossary.mjs` 从 [GLOSSARY.yaml](GLOSSARY.yaml) 生成，请勿独立编辑。中文为 PADF 建议；词条状态不代表系统设计或操作获批。

## ProductAndRequirements

| ID / 状态 | 中文 / English | 定义 | 来源 |
| --- | --- | --- | --- |
| PADF-TERM-PR-001 / PROPOSED | 需求 / Requirement | 为满足业务需要必须具备的条件或能力；需求陈述与实现方案、候选建议和批准事实分别说明。 | [PMI-LEXICON](https://www.pmi.org/standards/lexicon)、[PADF-PRODUCT](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/product-definition.md) |
| PADF-TERM-PR-002 / PROPOSED | 验收条件 / Acceptance Criteria | 用于判断交付结果能否被接受的条件；在规格中写出可观察结果及重要失败边界，列出条件不等于已验收。 | [PMI-AC](https://www.pmi.org/-/media/pmi/documents/public/pdf/learning/thought-leadership/benefits-realization-management-framework.pdf?rev=18728b10d12a4cbdaee43bb2f663739b)、[PADF-PRODUCT](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/product-definition.md) |
| PADF-TERM-PR-003 / PROPOSED | 功能项 / Feature | 围绕可辨识用户结果组织的一组产品能力；PADF以稳定Feature ID关联规格与任务，Feature ID和工作跟踪Issue ID分别保留。 | [PADF-PRODUCT](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/product-definition.md) |
| PADF-TERM-PR-004 / PROPOSED | 高层规格 / High Level Specification | PA说明问题、用户场景、范围、关键规则与业务验收的产品级规格；足以供SA/UI设计，不预先规定全部API或数据结构。 | [PADF-PRODUCT](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/product-definition.md) |
| PADF-TERM-PR-005 / PROPOSED | 功能目录 / Feature Catalog | 索引当前功能、价值/优先级、关系依赖和规格版本；SA补实现复杂度，Master维护实施顺序，目录不能替代行为规格。 | [PADF-PRODUCT](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/product-definition.md)、[PADF-PLAN](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/templates/implementation-plan.md) |
| PADF-TERM-PR-006 / PROPOSED | 功能规格 / Feature Specification | PADF实施级规格，结合产品输入和适用的批准设计，明确输入输出、状态、异常、接口约束与可执行验收；不能仅凭标题认定就绪。 | [PADF-PRODUCT](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/product-definition.md) |

## ProjectManagement

| ID / 状态 | 中文 / English | 定义 | 来源 |
| --- | --- | --- | --- |
| PADF-TERM-PM-001 / PROPOSED | 范围 / Scope | 当前任务或交付覆盖的工作、结果与排除项；范围不等于全部产品愿景，也不等于架构Profile或执行权限。 | [PADF-TASK](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/task-contract.md)、[PADF-PLAN](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/templates/implementation-plan.md) |
| PADF-TERM-PM-002 / PROPOSED | 里程碑 / Milestone | 项目中有意义的检查点或事件，用于计划和判断阶段结果；里程碑名称不证明结果已经交付或获得接受。 | [PMI-MILESTONE](https://www.pmi.org/learning/library/establishing-project-management-office-agile-6121)、[PADF-PLAN](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/templates/implementation-plan.md) |
| PADF-TERM-PM-003 / PROPOSED | 迭代 / Iteration | 围绕一段有界目标安排的一轮工作与反馈；PADF由Master结合价值、依赖、风险和容量规划，不从复杂度等级直接换算固定时长。 | [PADF-PLAN](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/templates/implementation-plan.md) |
| PADF-TERM-PM-004 / PROPOSED | 依赖 / Dependency | 某项工作或结果继续推进所需的前置输入、条件或协作关系；区分计划依赖与已满足依赖的证据。 | [PADF-TASK](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/task-contract.md)、[PADF-DISPATCH](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/agent-dispatch.md) |
| PADF-TERM-PM-005 / PROPOSED | 风险 / Risk | 可能影响当前目标、质量或安全的尚不确定情况及其影响；已发生的问题另记问题/阻塞，风险接受必须有适用决定。 | [PADF-TASK](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/task-contract.md)、[PADF-GATE](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/design-gate.md)、[PADF-APPROVAL](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/governance/approval-policy.md) |
| PADF-TERM-PM-006 / PROPOSED | 渐进细化 / Progressive Elaboration | 随着当前输入、决定和实施需要明确，逐步补足下一步必需的规格与设计；不预先穷举全部模块，也不省略当前关键约束。 | [PADF-PRODUCT](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/product-definition.md)、[PADF-METHOD](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/workflow/role-work-method.md) |

## Architecture

| ID / 状态 | 中文 / English | 定义 | 来源 |
| --- | --- | --- | --- |
| PADF-TERM-AR-001 / PROPOSED | 软件架构 / Software Architecture | 软件系统的重要结构、职责、协作及约束；用架构描述表达，文档或图不是系统本身。 | [ISO-42010](https://www.iso.org/standard/74393.html)、[ARC42-BLOCKS](https://docs.arc42.org/section-5/) |
| PADF-TERM-AR-002 / PROPOSED | 架构描述 / Architecture Description | 表达所关注对象架构的信息，可由正文、模型与视图共同组成；与被描述的架构有别。 | [ISO-42010](https://www.iso.org/standard/74393.html) |
| PADF-TERM-AR-003 / PROPOSED | 架构视图 / Architecture View | 针对明确关注问题呈现架构的某一部分；需说明对象、层级和来源，不能把不同视图中的同一节点误当新服务。 | [ARC42-BLOCKS](https://docs.arc42.org/section-5/)、[C4-CONTAINER](https://c4model.com/abstractions/container) |
| PADF-TERM-AR-004 / PROPOSED | 容器（C4） / Container (C4) | C4中表示应用或数据存储的运行时边界；例如Web应用、API、数据库或文件存储，不专指Docker，也不等于单一操作系统进程。 | [C4-CONTAINER](https://c4model.com/abstractions/container) |
| PADF-TERM-AR-005 / PROPOSED | 组件（C4） / Component (C4) | C4中通过明确接口封装相关功能、位于一个Container内的单元；组件不作为独立部署单元。 | [C4-COMPONENT](https://c4model.com/abstractions/component) |
| PADF-TERM-AR-006 / PROPOSED | 模块 / Module | 按职责组织的软件单元，可对应逻辑边界或代码组织；不能只凭名称推断独立进程、部署单元或DDD限界上下文。 | [ARC42-BLOCKS](https://docs.arc42.org/section-5/)、[C4-COMPONENT](https://c4model.com/abstractions/component) |
| PADF-TERM-AR-007 / PROPOSED | 限界上下文 / Bounded Context | DDD中一个领域模型及其统一语言保持一致的明确适用范围；不同上下文之间需明确关系。 | [DDD-CONTEXT](https://martinfowler.com/bliki/BoundedContext.html) |
| PADF-TERM-AR-008 / PROPOSED | 架构决策记录 / Architecture Decision Record | 记录重要架构选择的背景、候选方案、选择理由及影响；记录存在不等于决定已获批准，历史记录不以语言整理重写。 | [ARC42-ADR](https://docs.arc42.org/section-9/)、[PADF-APPROVAL](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/governance/approval-policy.md) |
| PADF-TERM-AR-009 / PROPOSED | 单一权威来源 / Single Source of Truth | 对某一事实范围承担当前维护责任的来源；须说明适用范围、版本和冲突处理，不要求所有事实集中到一个文件。 | [PADF-METHOD](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/workflow/role-work-method.md) |

## Engineering

| ID / 状态 | 中文 / English | 定义 | 来源 |
| --- | --- | --- | --- |
| PADF-TERM-EN-001 / PROPOSED | 接口契约 / Interface Contract | 参与方对调用、输入输出、权限、错误和兼容行为的约定；接口签名只是其中一部分。 | [PADF-GATE](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/design-gate.md)、[PADF-PRODUCT](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/product-definition.md) |
| PADF-TERM-EN-002 / PROPOSED | 幂等性 / Idempotency | 重复相同请求的预期效果与单次执行相同；不因此保证每次响应字节相同，重试识别及结果保存规则另查项目契约。 | [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods) |
| PADF-TERM-EN-003 / PROPOSED | 事务发件箱 / Transactional Outbox | 在保存业务变更的同一事务中保存待投递消息，再异步发送的模式；发送可能重复，接收方仍须处理重复。 | [OUTBOX](https://microservices.io/patterns/data/transactional-outbox.html) |
| PADF-TERM-EN-004 / PROPOSED | 消息消费者 / Message Consumer | 接收并处理消息的一方；需说明消息语义、投递和重复处理约束，不能因“消费者”一词较抽象就删除。 | [OUTBOX](https://microservices.io/patterns/data/transactional-outbox.html) |
| PADF-TERM-EN-005 / PROPOSED | 闭包 / Closure | 程序设计中函数与其可访问的词法环境的结合；具体语义依语言。普通文档完整性或工作收尾不自动具有此含义。 | [MDN-CLOSURE](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) |

## AI

| ID / 状态 | 中文 / English | 定义 | 来源 |
| --- | --- | --- | --- |
| PADF-TERM-AI-001 / PROPOSED | AI智能体 / AI Agent | 在本词表的LLM工程语境中，依据目标、上下文与反馈选择后续步骤及工具的软件执行体；自主程度、工具和权限须另述。 | [ANTHROPIC-AGENTS](https://www.anthropic.com/research/building-effective-agents) |
| PADF-TERM-AI-002 / PROPOSED | 开发智能体 / Development Agent | 参与需求、设计、编码、测试或协调等软件交付工作的Agent；PADF角色描述责任，不自动授予产品数据、编码或生产权限。 | [PADF-DISPATCH](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/agent-dispatch.md)、[ANTHROPIC-AGENTS](https://www.anthropic.com/research/building-effective-agents) |
| PADF-TERM-AI-003 / PROPOSED | 产品内智能体 / Product Agent | 作为产品能力为最终用户执行有界任务的Agent；其数据访问、动作和人工确认由具体产品定义，不继承开发Agent权限。 | [ANTHROPIC-AGENTS](https://www.anthropic.com/research/building-effective-agents)、[PADF-PRODUCT](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/product-definition.md) |
| PADF-TERM-AI-004 / PROPOSED | 机器学习模型 / Machine Learning Model | 通过训练得到、用于对输入产生预测或生成结果的计算模型；模型本身不等于带任务状态、工具执行与权限控制的完整Agent。 | [GOOGLE-ML](https://developers.google.com/machine-learning/glossary)、[ANTHROPIC-AGENTS](https://www.anthropic.com/research/building-effective-agents) |
| PADF-TERM-AI-005 / PROPOSED | 工具 / Tool | 运行环境提供、具有明确输入输出的可执行能力；能否执行及访问什么由工具和应用权限决定。 | [ANTHROPIC-TOOLS](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) |
| PADF-TERM-AI-006 / PROPOSED | 工具调用 / Tool Calling | 模型或Agent给出工具名称与参数，由运行环境执行能力并返回结果的交互；调用请求不证明执行成功。 | [ANTHROPIC-TOOLS](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) |
| PADF-TERM-AI-007 / PROPOSED | 智能体技能包 / Agent Skill | 可按需发现和加载的任务指令、资源与可选脚本包；Skill描述做法，文件本身不是运行中的Agent或已经完成的工具动作。 | [AGENT-SKILLS](https://agentskills.io/home) |
| PADF-TERM-AI-008 / PROPOSED | 工作流 / Workflow | 按步骤、条件和依赖组织任务的过程，可包含人、工具和Agent；预设流程不意味着每步都自主决定。 | [ANTHROPIC-AGENTS](https://www.anthropic.com/research/building-effective-agents)、[PADF-DISPATCH](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/agent-dispatch.md) |
| PADF-TERM-AI-009 / PROPOSED | 自动化 / Automation | 由触发条件或计划启动并自动执行任务的机制；可执行单个动作或工作流，不要求使用AI或Agent。 | [MS-AUTOMATION](https://learn.microsoft.com/en-us/power-automate/getting-started)、[PADF-DISPATCH](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/agent-dispatch.md) |
| PADF-TERM-AI-010 / PROPOSED | 智能体编排 / Agent Orchestration | 协调Agent任务、依赖、工具与结果交接的过程或机制；可结合预设工作流和动态分派，编排不等于批准。 | [ANTHROPIC-AGENTS](https://www.anthropic.com/research/building-effective-agents)、[PADF-DISPATCH](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/agent-dispatch.md) |
| PADF-TERM-AI-011 / PROPOSED | 大语言模型 / Large Language Model | 参数规模通常较大的语言模型类别；实际能力与资源需求按具体模型说明和任务评估，LLM不是Agent的同义词。 | [GOOGLE-ML](https://developers.google.com/machine-learning/glossary)、[MS-SLM](https://www.microsoft.com/en-us/microsoft-cloud/blog/2024/11/11/explore-ai-models-key-differences-between-small-language-models-and-large-language-models/) |
| PADF-TERM-AI-012 / PROPOSED | 小语言模型 / Small Language Model | 相对较小、常着重资源效率的语言模型类别；相对谁、适用任务及规模须具体说明，不设跨厂商统一参数阈值。 | [MS-SLM](https://www.microsoft.com/en-us/microsoft-cloud/blog/2024/11/11/explore-ai-models-key-differences-between-small-language-models-and-large-language-models/) |
| PADF-TERM-AI-013 / PROPOSED | 检索增强生成 / Retrieval-Augmented Generation | 将检索取得的外部信息用作生成依据的方法；单独全文检索、向量检索或展示结果列表不等于RAG。 | [RAG-PAPER](https://arxiv.org/abs/2005.11401) |
| PADF-TERM-AI-014 / PROPOSED | 嵌入表示 / Embedding | 把内容映射为可计算的数值表示，常用向量承载；表示相似性不证明事实相同或来源可靠。 | [GOOGLE-ML](https://developers.google.com/machine-learning/glossary)、[MS-VECTOR](https://learn.microsoft.com/en-us/azure/search/vector-search-overview) |
| PADF-TERM-AI-015 / PROPOSED | 向量检索 / Vector Search | 按查询与候选向量的距离或相似度查找结果的技术；受表示、距离函数和索引方法影响。 | [MS-VECTOR](https://learn.microsoft.com/en-us/azure/search/vector-search-overview) |
| PADF-TERM-AI-016 / PROPOSED | 语义检索 / Semantic Search | 以查询与内容的含义、意图或语境匹配为目标的检索能力；向量检索是常见实现机制，二者描述层面不同。 | [ELASTIC-SEMANTIC](https://www.elastic.co/what-is/semantic-search)、[MS-VECTOR](https://learn.microsoft.com/en-us/azure/search/vector-search-overview) |
| PADF-TERM-AI-017 / PROPOSED | 知识图谱 / Knowledge Graph | 以实体及其明确关系组织知识的图结构；普通链接清单或相似度连线不足以说明已形成一致领域模型。 | [GOOGLE-KG](https://blog.google/products-and-platforms/products/search/introducing-knowledge-graph-things-not/) |
| PADF-TERM-AI-018 / PROPOSED | 知识片段 / Knowledge Fragment | 为引用、检索或知识处理选取的有界内容单元；使用时说明来源、上下文及其为原文、解释还是生成内容。稳定身份、粒度与生命周期由项目定义。 | [W3C-ANNOTATION](https://www.w3.org/TR/annotation-model/)、[PADF-METHOD](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/workflow/role-work-method.md) |
| PADF-TERM-AI-019 / PROPOSED | AI评估 / AI Evaluation | 依据明确任务、数据、方法与指标检查模型或AI系统表现的过程；记录准确版本和限制，一次示例不能替代充分评估或验收。 | [HF-EVALUATE](https://huggingface.co/docs/evaluate/index) |
| PADF-TERM-AI-020 / PROPOSED | 基准测试 / Benchmark | 使用约定任务、数据和评价方法作可比较测量；基准集或得分只反映覆盖范围，不能代替整个产品验收。 | [MATH-PAPER](https://arxiv.org/abs/2103.03874)、[HF-EVALUATE](https://huggingface.co/docs/evaluate/index) |
| PADF-TERM-AI-021 / PROPOSED | 提示词 / Prompt | 提供给生成模型以引导输出的输入，可包含任务、上下文和示例；不只指单词，也不自动等于系统级指令。 | [GOOGLE-ML](https://developers.google.com/machine-learning/glossary) |
| PADF-TERM-AI-022 / PROPOSED | 模型推理 / Model Inference | 把训练后的模型应用于输入以产生预测或生成结果的计算过程；与训练有别，也不保证逻辑判断正确。 | [GOOGLE-ML](https://developers.google.com/machine-learning/glossary) |
| PADF-TERM-AI-023 / PROPOSED | 模型漂移 / Model Drift | 模型投入使用后，相对于明确参考数据或评估基线观察到的数据、预测或表现变化的概括表达；须进一步指明具体信号及方法，不等于模型文件版本变化。 | [MS-DRIFT](https://learn.microsoft.com/en-us/azure/machine-learning/concept-model-monitoring?view=azureml-api-2) |
| PADF-TERM-AI-024 / PROPOSED | 系统指令 / System Instructions | 由应用在系统级配置以引导模型角色和行为的指令；具体层级与优先级依平台，不能代替服务端权限控制。 | [GOOGLE-SYSTEM](https://ai.google.dev/gemini-api/docs/text-generation#system-instructions-and-other-configurations)、[PADF-APPROVAL](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/governance/approval-policy.md) |
| PADF-TERM-AI-025 / PROPOSED | 人在回路中 / Human-in-the-loop | 在人机过程的明确环节让人参与判断、评估或确认；需写明谁在何时处理什么，不能只凭此标签声称所有动作均受人工控制。 | [GOOGLE-ML](https://developers.google.com/machine-learning/glossary)、[PADF-APPROVAL](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/governance/approval-policy.md) |
| PADF-TERM-AI-026 / PROPOSED | AI生成内容 / AI-generated Content | 由生成式AI产生的文字、图像等内容；PADF要求区分生成建议、原始证据和真实确认，不能把生成内容直接当已核实事实。 | [PADF-METHOD](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/workflow/role-work-method.md)、[GOOGLE-SYSTEM](https://ai.google.dev/gemini-api/docs/text-generation#system-instructions-and-other-configurations) |

## PADF_Governance

| ID / 状态 | 中文 / English | 定义 | 来源 |
| --- | --- | --- | --- |
| PADF-TERM-GV-001 / PROPOSED | 任务 / Task | 有目标、范围、输入、责任、预期交付和停止条件的有界工作；任务说明不自动启动运行时或授予额外权限。 | [PADF-TASK](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/task-contract.md) |
| PADF-TERM-GV-002 / PROPOSED | 交接记录 / Handoff | 传递任务责任、可核验产物版本、结果、未决项和下一步的记录；收到或ACK不等于批准。 | [PADF-HANDOFF](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/agent-handoff.md) |
| PADF-TERM-GV-003 / PROPOSED | 设计就绪检查 / Design Gate | Master按既有契约核对设计内容、依赖、版本、必要独立审查和批准；检查结果与专业审查、Owner决定及编码授权分别记录。 | [PADF-GATE](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/design-gate.md) |
| PADF-TERM-GV-004 / PROPOSED | 独立审查 / Independent Review | 未参与被审实现/设计的Reviewer依据原需求、精确版本和实际差异作判断；APPROVE是审查结论，不授予Owner权限。 | [PADF-GATE](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/design-gate.md)、[PADF-APPROVAL](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/governance/approval-policy.md) |
| PADF-TERM-GV-005 / PROPOSED | 批准 / Approval | 有权人员对明确动作、范围、条件及版本作出的许可或决定；不得从CI、ACK、合并或专业质量结论推定另一项批准。 | [PADF-APPROVAL](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/governance/approval-policy.md) |
| PADF-TERM-GV-006 / PROPOSED | 基线 / Baseline | 用于后续工作的明确版本化依据；是否获批、适用范围及批准引用须分别核验，固定SHA本身不等于批准。 | [PADF-GATE](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/design-gate.md) |
| PADF-TERM-GV-007 / PROPOSED | Owner验收 / Owner Acceptance | Owner针对明确交付范围和准确版本作出的接受决定；文档接受、技术设计批准、编码、合并和部署各有边界。 | [PADF-APPROVAL](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/governance/approval-policy.md) |
| PADF-TERM-GV-008 / PROPOSED | 任务分派 / Dispatch | Master在有效授权内给实际执行角色的有界安排；保留分派、实际执行、交接和依赖协调的证据，消息持久化不证明已执行。 | [PADF-DISPATCH](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b0c2bb06ea5f612b2ea372e3d24c3a68644938df/contracts/agent-dispatch.md) |

来源核验范围、别名、条件性用词提醒及例句见唯一数据源；[使用与保护规则](README.md)。
