# 两阶段 Feature Spec 与设计交接

Schema：`padf.product-definition/v1`。Product Analyst 负责产品级 High Level Specs 和 Feature Catalog；Module Designer（沿用角色 ID `module-architect`）依据产品输入、SA 与 UI 细化实施级 Feature Specs。Master 协调收件、交接和计划，Owner 保留重大决定。

两阶段是内容责任，不是两份必建文件或强制两次审批。当前意图/验收足以支持 SA/UI 即停止 PA 细化；实施级规格只补执行必须知道的行为和约束。已有有效内容按版本引用，不展开未批准的未来功能；简单任务按下述裁剪路径合并，必要门禁不变。

## 第一阶段：产品级 High Level Specs（PA）

明确问题、目标用户/场景、核心旅程、价值、范围/排除项、关键业务规则与成功/失败结果、产品约束、重要异常/权限/可撤销边界和业务验收。使用[产品级规格模板](../templates/product-spec.md)或已有 PRD 章节，不要求预先设计 API、表结构、组件或逐字段交互。

[Feature Catalog](../templates/feature-catalog.md)以稳定 Feature ID 关联 High Level Spec、价值/优先级、内在关系/依赖、实施级 Spec（初期可待细化）。PA 提出产品优先级与可验收切片建议，不独自承诺实现成本或最终 milestone/iteration。只有名称和一句话功能仍不足以交接，但不把实施级细节前置给 PA。

## 第二阶段：实施级 Feature Specs（Module Designer）

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
