# 两阶段 Feature Spec 与设计交接

Schema：`padf.product-definition/v1`。Product Analyst 负责产品级 High Level Specs 和 Feature Catalog；Module Designer（沿用角色 ID `module-architect`）依据产品输入、SA 与 UI 细化实施级 Feature Specs。Master 协调收件、交接和计划，Owner 保留重大决定。

两阶段是内容责任，不是两份必建文件或强制两次审批。当前意图/验收足以支持 SA/UI 即停止 PA 细化；实施级规格只补执行必须知道的行为和约束。已有有效内容按版本引用，不展开未批准的未来功能；简单任务按下述裁剪路径合并，必要门禁不变。

## 第一阶段：产品级 High Level Specs（PA）

明确问题、目标用户/场景、核心旅程、价值、范围/排除项、关键业务规则与成功/失败结果、产品约束、重要异常/权限/可撤销边界和业务验收。使用[产品级规格模板](../templates/product-spec.md)或已有 PRD 章节，不要求预先设计 API、表结构、组件或逐字段交互。

[Feature Catalog](../templates/feature-catalog.md)以稳定 Feature ID 关联 High Level Spec、价值/优先级、内在关系/依赖、实施级 Spec（初期可待细化）。PA 提出产品优先级与可验收切片建议，不独自承诺实现成本或最终 milestone/iteration。只有名称和一句话功能仍不足以交接，但不把实施级细节前置给 PA。

## 需求发现与定义（Requirements Discovery & Definition v0.1）

这是第一阶段的执行方法，沿用现有 PRD/High Level Spec、Catalog 和交接，不新增角色、数据库、机器 Schema 或审批阶段。输入已充分时直接复用；下表描述工作内容，不是新增运行时状态机。

| 触发与输入 | PA 的动作与必要输出 |
| --- | --- |
| 初始目标模糊、材料零散 | 先读已有需求/决定，围绕业务目标、角色、活动、痛点及约束找缺口，提出有来源标记的候选需求；不能只改写客户原话，也不把可能需要的功能当成事实。 |
| 存在缺失、冲突、重大歧义或不可验证表述 | 检查业务流程、规则、数据、正常/替代/异常、依赖/约束及验收预期。每轮先问少量会改变范围/结果的高影响问题，给实质不同的选项、推荐理由与业务影响；记录已答内容及来源，只追问剩余缺口。重要答案未到时暂停依赖它的定义，其余授权研究可继续。 |
| 目标清楚，仍缺方案依据 | 按[共用研究方法](../workflow/role-work-method.md#用问题控制研究)查类似任务/行业实践，只研究能支持当前决定的问题；保留外部依据、推断及推荐的身份，研究本身不能确认产品需求。 |
| 当前切片已有足够回答 | 在原规格定义 Feature/业务 AC，关联来源和决定；按下述规则验证并交接准确基线。Module 再结合 SA/UI 细化实施规格，PA 不预设接口、表结构或技术方案。 |

按 `Business Goal → Capability → Business Process / Use Case → Feature → Acceptance Criteria` 保持目标到功能的逻辑关联；小改动可在同一段中合并中间层，只保留必要关系，不强制独立 BRD、Use Case 或逐层分配新 ID。Feature 及被下游引用的规则/AC 使用稳定 ID，注明业务前置、共享规则或互斥关系。大项目先形成覆盖已知范围的 Catalog，区分已确认、候选和暂缓；只详细定义近期切片（Rolling-Wave Planning），不为远期功能预写实施细节。

每项当前 Feature 按风险写清：ID/名称及业务目标、范围/排除项、角色、主要流程、重要替代/异常、业务规则、相关数据、依赖、AC、未决项、来源/决定及基线版本。可链接共同规则或已有章节；不适用内容可省略。AC 至少能说明条件/输入、动作与可观察结果，供 QA 判断对错；“易用”“流程正常”不足。修正 AC 时先提出可测写法，未经确认的数值阈值、权限或业务规则仍为候选，不能借可测试性扩写范围。

逐轮更新和最终汇总沿用原 Feature/规则/AC ID 与含义，不为排版重新编号或复用旧 ID 表示别的对象；细化、拆分或范围变化在原文标明前后关系、适用版本与决定状态，不隐含批准，交接前核对早先引用仍指向同一对象。

### 来源与决定状态分开

在原需求/规则或其已有索引记录两个维度，不另造一份需求正文；已有等价字段可映射，STC 的 OBSERVED/UNKNOWN 是来源观测，不能代替需求决定状态。

| 维度 | 本方法用语与含义 |
| --- | --- |
| Requirement Origin（来源） | `USER_STATED` 用户明确提出；`EXISTING_BASELINE` 既有有效基线；`RESEARCH_REFERENCE` 外部参考；`AGENT_INFERENCE` Agent 推断；`AGENT_RECOMMENDATION` Agent 建议。保留实际来源引用；多种来源可并列，之后确认也不抹去原始来源。 |
| Requirement Decision Status（决定） | `CANDIDATE` 候选；`NEEDS_CLARIFICATION` 待澄清；`CONFIRMED` 已确认；`REJECTED` 已拒绝；`SUPERSEDED` 已被明确替代。旧 `candidate/PROPOSED` 按语义映射候选，不机械重命名历史数据。 |

`USER_STATED` 不自动等于 `CONFIRMED`。CONFIRMED 须关联真实确认来源、确认人/其权限及适用的内容版本/范围；继承已有基线时核验原确认仍适用。研究、推断、推荐、Master ACK、沉默或测试通过都不是确认。Owner 明确采纳后可确认 Agent 建议，但保留其来源与实际确认记录。

关键目标、重要业务规则、产品范围及其他保留决定由 Owner 实际确认，沿用[审批策略](../governance/approval-policy.md)；不为普通分析结论或对既有已确认规则的忠实整理新增批准。普通明确需求可引用有权需求方的原始陈述或既有有效确认，Agent 自己的推断不能充当该来源。重大性不清时说明影响并交 Master 判断需谁决定，不能自行降级。

最小写法（可用原文一行或已有字段，不强制新增 YAML）：`稳定 ID | 来源类别及引用 | 决定状态 | 确认人/来源及适用版本（仅 CONFIRMED）`。同一确认可覆盖一组明确需求，不逐条重复索取。内容变更或冲突时先核验当前有效版本与确认范围；新草案不能因日期更新覆盖已确认规格，旧确认也不能覆盖已改变内容。记录替代关系和影响，未决部分不静默并入基线。

### Feature Baseline 的完成条件与交接

PA 与 Master 针对**本次拟交付的切片**核对六项：关键角色/正常及异常无遗漏；规则和功能相容；重大歧义/假设已处理；AC 可判断；来源/决定/版本可定位；必要 Owner 确认有效。任何缺口要说明受影响 Feature/行为和下一责任人；不能靠字段齐全判定完成。

已确认 Feature Baseline 是准确版本的产品规格/Catalog及其有效规则与 AC 的引用集合，不是第二份文档。仅包含当前已确认内容；候选、待澄清、已拒绝或被替代内容可留在原文单独标识，但不属于有效基线。若未决项会改变当前 Feature 的范围、权限、主要结果或验收，该 Feature 不能声称基线就绪；独立且不受影响的切片可继续。远期未细化不阻断近期，未决问题仍须标明影响。

按原[Handoff](agent-handoff.md)交给 Master：本次 Feature IDs、准确产品基线/规则/AC版本、依赖、确认引用、未决项及对下游的约束；Master 读件/核验并协调实际 ACK，不重新编写一套规格。基线仅表示可供相应下游设计使用，不等于 Design Gate、Coding Authorization 或 Owner Acceptance；最终设计就绪仍按本文原两阶段与现有 Gate。

`Feature` 定义产品实现什么；`Work Package` 是交付它的有界工作；`Agent Run` 是执行工作的一次实际运行。Master 可依据当前切片/依赖、SA复杂度、风险和授权提出候选 Work Packages，引用已有 Task Contract/Dispatch；一项 Feature 可需多包，一个包可涉及多项 Feature，一包可有多次执行。不能用运行完成代替 Feature 验收，也不能从基线自动授权编码。本轮不实现自动任务分解器。

### 下游 Requirement Finding 最小接口

UI、SA、Module、Coder 或 QA 在原任务/PR 提交 `Feature ID + Finding + Source + Impact + Proposed Action`；Source 应定位发现所依据的规格/证据及版本，Impact 说明受影响行为或依赖。Master 接收、确定负责 PA 并协调；PA 分析原意、来源冲突与候选修改，实质产品决定交 Owner。提出者不直接修改已批准 Feature Baseline；澄清结果回到原权威规格及既有 Handoff。只约定输入和接收责任，不新增跨阶段 UI/架构需求修订工作流、状态机或自动同步。

## 第二阶段：实施级 Feature Specs（Module Designer）

PA为目标、业务规则、AC和重要正常/异常/权限场景保留稳定ID/来源版本，与QA在需求形成时分析Functional Scenarios；当前Feature准备实施时再细化必要TC，不预写全部未来用例。Module继续承担实施级具体化。按[追溯契约](requirements-traceability.md)关联已有Catalog/AC/TC/设计/实现/结果，不复制正文；候选Discovery对象与批准对象分别记录，不能由关联或测试PASS推导批准/验收。

以已就绪的产品级规格、精确批准的系统方案，以及适用的已确认概念图/关键流程为输入，具体化前置条件、数据/输入输出、正常/异常流程、规则与状态转换、用户修改/撤销/确认/拒绝、接口/数据结构、并发/事务/迁移、UX 事件/反馈、依赖与可执行验收。详见[实施级模板](../templates/feature-spec.md)和[模块设计](module-design.md)。

实施细化可以把产品意图转成具体行为，不得暗改价值、权限、范围或业务规则。新产品取舍由 Master 回 PA，重大变化交 Owner；技术冲突回 SA，体验冲突回 UI。详细 Spec 与模块结构可同文维护，不能让 Coder 在编码时补关键设计。

## Master 协调的 Handoff 与计划

1. PA → Master → SA/UI：链接 High Level Specs、Catalog、关键决定/开放问题、精确版本。接收方 ACK 或 NEEDS_REFINEMENT；关键方向不清只阻断依赖部分，研究可继续。
2. SA 初评整个技术实现，逐 Feature 在 Catalog 填写五级复杂度、理由/置信与依赖，见[系统方案](solution-architecture.md)。Master 综合价值、复杂度、功能内在关系、风险与容量提出[Milestone/Iteration 计划](../templates/implementation-plan.md)，不把复杂度等级当工期承诺。
3. SA/UI → Master → Module：交付批准系统基线及适用的已确认概念图 精确版本、产品输入、接口/约束/未决项。Module 细化 Spec 并反馈可实现性；UI 前端高保真原型可再消费该细化，**不要求 SA/UI 先拿到最终实施级 Spec，也不要求 Module 等待最终前端原型**。
4. Module → Master → Coder/QA：交接实施级 Spec、系统/UI追溯、模块设计与验收。复用原 [Handoff](agent-handoff.md)，不新增消息协议；接收方 ACK，Master 核对变化/依赖后推进。

简单项目/已有明确的局部变更可以合并两层文档或合并执行步骤，记录裁剪理由、责任人、来源版本及实际收件确认；不为流程新开角色会话。仍须有足以实施/测试的详细内容，保留必要 SA/UI、独立审查、决定及编码授权，不以“简单”掩盖产品缺口。

## 路由与兼容

`product_scope: reuse | define | refine` 沿用：缺省产品定义/行为影响推断 define/refine；new-product 默认 define，无此信号保留旧 reuse。新应用已有有效获批产品规格可显式 reuse，仍需 SA；当前缺口/变化不能用 reuse 隐藏。

新两阶段任务声明 `product_spec_ref`（PA 高层）与 `feature_spec_ref`（Module 实施级）。define/refine 的必需 PA 阶段须 COMPLETED，具有验证/固定版本的 `product-definition` 和 `feature-specification`，后者匹配 `product_spec_ref`；PA 完成不等于最终 DESIGN_READY。Module 的必需阶段须 COMPLETED、附匹配 `feature_spec_ref` 的 `feature-specification` 和匹配的 `product_spec_ref`，以及引用实际 Handoff 的 `spec_handoff_ref`。仅 Catalog/高层规格、WAIVED 或陈旧引用都不能替代详细产物。

若新两阶段任务裁剪独立 Module，提供 `simple_spec_refinement: {rationale, evidence_ref, feature_spec_ref}`，其引用必须匹配最终详细规格；这只是实际内容收件/裁剪记录，不授予权限或排除已知模块影响所需角色。所有新阶段设计仍依赖 PA（若需要）；旧任务只含 `feature_spec_ref` 的兼容路径保留，不声称已按新两阶段执行。

只读门禁只检查元数据。Master/Reviewer 必须实际核对高层意图、细化内容与批准来源，不能靠填写字段制造批准。规格、方案或 UI 版本改变时，重核受影响细化、测试和独立审查。完成设计不授权业务编码、合并、发布或部署。
