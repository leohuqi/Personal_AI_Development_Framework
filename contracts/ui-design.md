# UI Design Package：概念图 → 确认 → 前端 Mockup

Schema：padf.ui-design/v1。UI Designer 负责体验与视觉，Master 协调，Owner 保留重大设计与授权决定。取消必须用 Figma 生成设计或原型的要求。

## 最小输入与分阶段交付

读取当前 Task Contract、PA 高层产品意图/验收、已有 SA 约束和精确批准 UI Profile。早期设计不等待 Module 最终 Spec；Module 可先根据已确认概念与批准 SA 细化，随后与前端 Mockup 对齐行为/API/错误。复用有效来源，不重做无关设计。

| 等级 | 当前交付与通过条件 |
| --- | --- |
| L1 概念草稿 | 少量概念图/线框、关键任务路径、必要状态与说明；方向未定先比较真实差异，不批量精化 |
| L2 高层概念原型 | 选定的概念图和流程已由 Owner 或获授权团队成员确认，版本可核验；不要求可点击源或 Figma |
| L3 高保真交互 Mockup | 确认概念后，用批准前端栈及有效有边界的原型制作授权直接实现可编辑、可运行的交互 Mockup；真实任务/状态测试及当前版本的 Impeccable 审查完成 |

复杂新交互/重大重设计/Owner 指定用 L3；明确的局部变更按实际影响复用。概念图不能声称交互已运行，Mockup 不能声称真实后端、联测或生产已完成。没有变更的概念确认可复用，不要求逐次重复批准。

默认 ui_delivery_mode: concept-mockup；原 staged 值作为兼容别名，省略也执行同样的当前规则，不保留可以绕过确认或审查的旧通道。ui_level 必须为 L1/L2/L3。

## 确认、Mockup 与审查的准确引用

在已有清单中维护，不新建审批平台：

- 每个必需 UI 阶段有准确版本的 ui-design 与一份选定 ui-concept；多个方案可在同一概念清单定位，未采用方案不作为当前必需产物。
- L2/L3，或 Module 要消费概念时，阶段记录 concept_confirmation：concept_ref、reviewer_role（OWNER / TEAM_MEMBER）、reviewer_id、confirmation_ref；团队成员另引用 delegation_ref，可为已有效的团队职责/任务授权，不逐次找 Owner 重批。确认必须针对当前概念，收到/一般意见不算确认。
- 重大设计/Profile/产品决定仍归 Owner。material_change 或 design-system 影响/风险需要 OWNER 确认，不能凭团队成员的普通技术职责替代；既有 Profile 精确批准门禁不变。机器标签不认证真人身份/权限，Master 实际核对来源。
- L3 顶层 frontend_stack_ref 固定批准前端基线；frontend_prototype_authorization_ref 引用有边界原型制作授权，独立于概念确认。授权可复用，不授予业务编码、合并或生产权限。
- interactive-prototype：固定源 ref，runtime: frontend、fidelity: high、editable_source: true、frontend_stack_ref、concept_ref、interaction_test_status: PASS，以及实际源/构建/启动/交互证据（可用一份完整报告的通用 evidence_ref 引用，不新增四套必填字段）。每个 Mockup 必须匹配当前概念与栈；L1/L2 不能夹带必需运行前端绕过授权。
- L3 顶层 impeccable_skill_ref 固定项目实际采用的 Impeccable Skill 源；每个 Mockup 有一份对应 impeccable-review 产物，字段为 tool: impeccable、skill_ref、target_ref（准确 Mockup 源）、profile_ref、status: PASS、findings（明确数组），以及报告 ref@SHA、verified 和 evidence_ref。源、Profile 或工具版本改变后重核受影响审查，旧报告不算当前通过。

L1/L2 可按需提供概念审查，target_ref 指当前概念；不提供不新增该阶段的工具要求，但已提供报告和已知发现仍按当前源/Skill/Profile及下述规则核对，不能用等级低忽略阻断。

审查发现以 P0–P3、状态和实际影响记录。报告或所在阶段标为可选只影响交付选择，不能忽略已提供报告中的失败结论、畸形发现或未处置问题；所有角色/阶段上指向当前选定概念/Mockup的报告均核对来源、Profile、Skill、结果和发现。显式指向另一固定版本且未选用的可选草稿不变成当前必交物；没有target或来源不明不能冒充无关参考。Master仍核对真实未解决风险，不靠更改引用藏匿。未修复 P0/P1 阻断，P2 修复或 Owner 逐项明确接受条件（沿用 owner_risk_acceptance_ref 与 acceptance_conditions），P3 可跟踪；PASS 标签不能遮盖未处置发现。报告明确实际执行、人工按指南检查、未运行及工具限制；分数或 detector clean 不等于任务好用，也不等于独立 DESIGN 审查。详见[Impeccable 适配](../integrations/impeccable.md)。

## 内容、验证与交接

按当前产品任务解释信息层级、导航、关键操作/反馈和适用的空态、加载、错误、权限、撤销及恢复。复用项目组件、tokens 和可访问性/响应式约束；不为凑状态/页面数量扩范围。

Module 在两阶段任务中以 ui_design_ref 引用已确认概念，结合 system_baseline_ref 细化 feature_spec_ref；无需等待最终 Mockup。Mockup 后续对齐该规格与真实 API/schema，合成数据和替身边界必须可见。冲突回 PA/SA/Master，不由 UI 暗补产品规则。

Handoff 只交当前概念/确认、Mockup、Profile、Impeccable 报告的准确版本，以及限制/下一动作；沿用原[交接](agent-handoff.md)。Master 读件、核对 Design Gate，L/XL 和风险触发 S/M 保留精确版本独立 DESIGN 审查，必要编码批准单独核验。

## 旧输入迁移

已发布历史文档、样例、tag 不回写。当前门禁不再读取 figma_confirmation / figma_design_ref 来制造概念确认，也不以 figma-design 替代前端 Mockup。旧任务迁移时显式提供选定概念、真实确认及当前 Mockup/Impeccable 证据；已有有效确认可引用，不自动伪造新字段。Figma 可作为自选参考附件，但缺少 Figma 不阻断新流程，只有 Figma 也不能满足 L3。
