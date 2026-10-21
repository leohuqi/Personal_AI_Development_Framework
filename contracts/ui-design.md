# 界面与交互设计包（UI/UX Design Package）— PADF V0.3

Schema: `padf.ui-design/v1`。UI/UX Designer 负责内容，Master 路由与协调，Independent Reviewer 按风险独立审查。

## 身份与方向依据

保留 `context_id`、Linear issue、不可变 Feature ID(s)、Feature Spec@approved SHA、项目 UI Profile@approved SHA、受影响组件、Designer、批准/状态、所选 L1/L2/L3 与理由。Profile 批准元数据沿用[项目契约](project-ui-profile.md)并绑定同一版本；PROPOSED 设计可作为草稿，不通过正式 Design Gate。

主成果围绕用户任务说明：用户/场景、任务成功条件、研究依据与限制、信息架构、关键流程、所选方向及理由，再给适用的详细规格和证据。来源与执行记录作为附录，不用页面清单替代用户体验方案。

## 方向收敛与裁剪

- 先利用产品规格、已有研究/设计和实际组件判断未知问题。研究应回答明确任务或设计问题，不要求所有任务重做竞品或用户测试；记录资料来源、版本/日期、方法、观察、推断与对本项目的影响。
- 区分资料阅读、设计者实际体验、专家评估、原型走查和真实用户测试。仅在有实际参与者、任务和观察记录时宣称用户测试；未执行则标记 NOT RUN，资料截图不能充当体验或测试证据。[NN/g 方法说明](https://www.nngroup.com/articles/competitive-usability-evaluations/)可用于选择竞品评估方法，不能代替项目证据。
- 信息架构和关键流程应说明内容/对象组织、入口/导航、用户决策、状态变化与失败恢复，关联产品任务和 API/数据约束。页面应服务于这些流程。
- 方向不明时，提供少量在任务路径、信息组织或交互方式上有实际差异的概念，用同一任务比较收益、理解负担、风险与推荐。记录 Owner 反馈及收敛方向后再做高保真/交互精化；未收敛不批量生成页面或全套 tokens。重大 UX/设计系统改变需要明确 Owner 批准，普通方向反馈不替代批准。
- 既有方向有效、影响明确的局部变更可复用研究、流程、组件和 tokens，交付必要差异及引用/裁剪理由；不强制重复探索或方向确认。关键输入缺失或新冲突必须澄清，不能用复用声明隐藏。

## 等级与证据

- **L1 Concept**：任务/研究依据、本功能设计理念、用户旅程、IA/导航与关键流程、标注概念线框/画面和取舍；适用时附概念比较及方向反馈。小修复可用现有 UI 的标注/描述，并说明 N/A 或复用理由。
- **L2 High-fidelity**：L1 加可审查设计源（可编辑 Figma 组件或版本化前端设计文件）、所选桌面/移动视口、组件变体/tokens/响应式规则、适用的错误/空态/加载/成功/权限/禁用状态、交互规格与验收追溯。
- **L3 Interactive**：L2 加实际可运行原型（支持工具中的可点击原型或可运行 HTML/应用），文档化源、入口 URL/文件与启动方式、支持交互、真实感合成内容以及任务/导航/状态转换的实际测试。复杂交互、重大 UX 重设计或 Owner 要求时选择 L3；静态截图/图不能替代。

等级不要求逐项新建文件，也不以页面数或热点数判定达标；按任务风险说明所选视口和场景的代表性。工具/素材/访问缺失则标记 NOT RUN/BLOCKED，不把概念图冒充已实现行为。

## UI 一致性矩阵（UI 变更必需）

`screen/interaction | component/design token ref | existing pattern | variation (if any) | reason/approval | breakpoint | a11y | test evidence`

检查 Profile 版本、核心 tokens、导航、组件 API/变体、表格/图表语义、键盘焦点、对比度、横向溢出及适用的加载/空态/错误/权限/交互。优先引用实际组件和已有规则，例外须明确影响及批准，不逐页建立冲突样式。

## 架构与任务质量对齐

每个 UI 数据交互引用批准 API/schema/contract 版本、事件时机、状态和错误。无法支持的假设向 Architect 发送 CLARIFICATION_REQUEST；实质产品/契约变化交 Master/Owner，不静默重定义需求。

验收以代表性任务能否完成、用户能否理解信息/当前状态/下一步、决策与输入负担以及失败后能否恢复为依据。说明适用的可发现性、流程中断、反馈、权限拒绝与纠错结果，关联无障碍与 API/数据行为。页面/点击热点数量和视觉精细程度不能替代这些证据；功能自查/模拟走查、独立 DESIGN 审查和真实用户测试分别记录。

## 产物证据与交接

保留清单字段与类型：`artifact_id | concept/high-fi/interactive | location | source revision | screenshot/video/build ref | actual test status PASS/FAIL/BLOCKED/NOT RUN | limitations`。设计源、渲染与行为证据分别说明：Figma 原型不是生产功能，渲染图片不是可编辑源，可点击原型也不证明用户测试已执行。

UI Designer 按[Agent Handoff](agent-handoff.md)交接主方案、精确版本、方向反馈、待决项和验证限制。Master 核对 Design Gate；L/XL 与风险触发的 S/M 由独立 Reviewer 审查精确版本。重大设计/Profile 批准、设计完成、审查结论与有边界编码授权是不同事实，不能互相替代。
