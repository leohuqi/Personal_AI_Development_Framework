# 产品定义与详细功能规格

Schema：`padf.product-definition/v1`，由 Product Analyst 负责；它可以是已有 PRD 和 Feature Specs 的章节，不要求另建重复文档。Master 整合目标及跨角色决定，Owner 批准重大方向/范围变化。

## 产品层

明确问题与用户、真实使用情境和核心任务、成功标准、约束与排除项；汇总问题驱动的研究结论和证据类别；给出核心旅程、功能之间的关系、优先级和可独立验证的版本切片。涉及数据安全/成本/习惯/体验偏好的关键未知先问 Owner，技术常规方案由相应角色研究推荐。

Feature Catalog 只承担 `Feature ID → 详细 Feature Spec → 所属阶段/依赖` 的索引。每个本阶段将进入模块设计或实现的功能必须链接具体定义；仅有名称、优先级和一句话说明不足以交接。

## 每项 Feature 应回答

- 谁为什么需要、何时触发，以及可观察的成功结果。
- 前置条件、输入/输出、数据来源与归属、权限和隐私约束。
- 正常步骤、业务规则/优先级、状态变化，以及重要异常和恢复。
- 用户可修改、撤销、确认或拒绝什么；不能撤销或有破坏性后果时说明影响。
- 与其他功能/版本的关系、依赖、排除项和本次交付阶段。
- 可验证验收标准：核心任务及重要失败/权限/边界场景，区分预期与实际证据。

详见[Feature Spec 模板](../templates/feature-spec.md)。不适用项说明理由，可合并表达；不以填表数量代替明确行为。产品规格定义“应该怎样”，架构/UI/模块角色负责“如何实现/呈现”，不能让模块设计阶段临时创造产品规则。

## 状态、复用与交接

明确草案、推荐与已批准内容；关键答案未回、行为冲突或必要决定未批时暂停受影响设计。仅批准方向不等于所有细节已完备，Catalog 也不等于详细规格。复用有效规格时引用精确版本与适用范围，只补变化；不强制重新调用 Product Analyst。

传递本阶段产品定义和各 Feature Spec 的固定版本、未决问题与需 Owner 决策项，按现有 Handoff 交给 Master、SA/UI 与 Module Architect。`COMPLETED` 不自动表示重大决定获批、DESIGN_READY 或编码授权。

## 声明式路由的增量输入

Task Contract 可选择 `product_scope: reuse | define | refine`（省略等价 reuse，以兼容 v0.3.2 已有有效规格路径）。`define/refine` 路由 Product Analyst，正式 Design Gate 要求其必需完成阶段及 `product-definition`、`feature-specification` 两类固定版本产物；后者须匹配顶层 `feature_spec_ref`。本次必需 SA/Module/UI 阶段依赖该产品阶段，早期研究/概念可并行，但不能绕过正式依赖门禁。

`reuse` 不代表批准空白规格；Master 仍按内容标准核对当前任务与已有批准来源。只读评估器不会读取文档判断行为完整或认证 Owner，人工内容检查与独立审查不能省略。
