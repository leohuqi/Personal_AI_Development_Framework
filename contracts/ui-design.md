# 界面与交互设计包（UI/UX Design Package）— PADF V0.3

Schema: `padf.ui-design/v1`。UI/UX Designer 负责内容，Master 路由与协调，Independent Reviewer 按风险独立审查。

## 身份与方向依据

保留 `context_id`、Linear issue、不可变 Feature ID(s)、项目 UI Profile@approved SHA、受影响组件、Designer、批准/状态、所选 L1/L2/L3 与理由。PA 高层业务目标、规则、验收及 Catalog 以 `product_spec_ref` 固定输入；UI 研究/概念/Figma 不以 Module 实施级 Feature Spec 已完成为前置。Module Architect（Module Designer）结合批准 SA 基线和已确认 Figma 细化实施级规格，以现有 `feature_spec_ref` 交付下游，不必等待最终前端原型。既有有效详细规格可直接复用，不强制重新启动 PA。Profile 批准元数据沿用[项目契约](project-ui-profile.md)并绑定同一版本；PROPOSED 设计可作为草稿，不通过正式 Design Gate。

主成果围绕用户任务说明：用户/场景、任务成功条件、研究依据与限制、信息架构、关键流程、所选方向及理由，再给适用的详细规格和证据。来源与执行记录作为附录，不用页面清单替代用户体验方案。

## 方向收敛与裁剪

- 先利用产品规格、已有研究/设计和实际组件判断未知问题。研究应回答明确任务或设计问题，不要求所有任务重做竞品或用户测试；记录资料来源、版本/日期、方法、观察、推断与对本项目的影响。
- 区分资料阅读、设计者实际体验、专家评估、原型走查和真实用户测试。仅在有实际参与者、任务和观察记录时宣称用户测试；未执行则标记 NOT RUN，资料截图不能充当体验或测试证据。[NN/g 方法说明](https://www.nngroup.com/articles/competitive-usability-evaluations/)可用于选择竞品评估方法，不能代替项目证据。
- 信息架构和关键流程应说明内容/对象组织、入口/导航、用户决策、状态变化与失败恢复，关联产品任务和 API/数据约束。页面应服务于这些流程。
- 方向不明时，提供少量在任务路径、信息组织或交互方式上有实际差异的概念，用同一任务比较收益、理解负担、风险与推荐。记录 Owner 反馈及收敛方向后再做高保真/交互精化；未收敛不批量生成页面或全套 tokens。重大 UX/设计系统改变需要明确 Owner 批准，普通方向反馈不替代批准。
- 既有方向有效、影响明确的局部变更可复用研究、流程、组件和 tokens，交付必要差异及引用/裁剪理由；不强制重复探索或方向确认。关键输入缺失或新冲突必须澄清，不能用复用声明隐藏。

## 三阶段交付、等级与证据

新项目复杂设计、重大新交互默认在 Task Contract 声明 `ui_delivery_mode: staged`；按初期概念→中期真实 Figma→经授权的最终前端原型推进。简单项目或已有明确局部变更可按风险选择 L1/L2/L3，记录既有源版本、影响、复用/裁剪理由与未执行阶段；裁剪不代表已完成 Figma，也不能隐去新的关键不确定或重大决定。L1/L2/L3 及既有任务格式保持兼容，旧格式不是绕过新复杂任务 staged 要求的方式。

| 阶段/等级 | 实际交付与推进条件 |
| --- | --- |
| 初期概念 / L1 | 任务/研究依据、理念、旅程、IA/关键流程、标注概念图/线框和取舍，适用的概念比较与方向反馈。`ui-concept` 提供实际源/证据；方向未收敛不批量精化。 |
| 中期 Figma / staged L2 | 真实可编辑 Figma 设计及代表性可点击流程，所选桌面/移动视口、组件变体/tokens/响应式、适用错误/空态/加载/成功/权限/禁用状态、无障碍及交互说明。保存真实链接、源与精确设计版本；静态图、HTML 和未核验链接不能替代 Figma。 |
| 最终前端高保真交互 / staged L3 | Figma 精确版本确认后，在有效原型制作授权范围内按项目已批准前端栈制作可运行原型，提供可编辑源、入口/启动、合成数据、支持范围及任务/导航/状态转换实测。Figma 点击不算最终运行前端，原型不等于生产实现。 |

L1 只要求概念；staged L2 需要真实 Figma；staged L3 需要完整确认→原型授权→运行前端证据。复杂交互、重大 UX 重设计或 Owner 指定选择 L3。未启用 staged 的既有 L2 保留可编辑 Figma 或版本化前端设计源，既有 L3 保留其已选工具/可运行原型契约；不把兼容描述当作新复杂任务的工具替代许可。

### staged 增量证据字段

沿用 `padf.ui-design/v1`，新增证据不改已有状态、原型等级和清单含义：

- `ui-concept`：版本化概念源与实际视觉证据。
- `figma-design`：`ref` 指向固定 SHA 的产物清单，另记录 `tool: figma`、真实 `figma_url`、`design_version` 与可编辑源/原型证据。设计清单 SHA 固定不代表远端 Figma 未变，须同时核验实际版本。
- staged L3 的每个必需 UI 阶段有 `ux.figma_confirmation: {design_ref, design_version, owner_confirmation_ref}`；`design_ref` 等于对应 Figma 清单 `ref`，`design_version` 等于实际确认版本，反馈永久链接必须针对该版本。普通方向反馈不自动代表此确认、Profile 批准或重大设计批准。
- 顶层 `frontend_prototype_authorization_ref` 单独引用有边界的前端原型制作授权；已有有效授权可引用，不逐次重问。它不授予生产业务编码、部署或合并权。
- `interactive-prototype` 使用 `runtime: frontend`；`frontend_stack_ref` 匹配顶层已批准前端基线的固定引用，`figma_design_ref` 匹配已确认 Figma 清单引用。保留原 `editable_source`、`interaction_test_status`，并给真实源/构建/启动和交互证据。确认其他 Figma 版本或使用其他前端栈均不能满足。

Figma 设计改变后重新核验确认、下游规格和原型一致性，不能用旧版本确认批准当前设计。缺 Figma 访问/工具、所需确认/授权或前端基线时，对应阶段 BLOCKED/NOT RUN；可继续不依赖它的获授权工作，不能暗换 HTML 等工具并声称 Figma 已完成。

等级不要求逐项新建文件，也不以页面数或热点数判定达标；按任务风险说明视口和场景代表性。工具/素材/访问缺失如实记录，不把概念图或可点击原型冒充已实现行为/用户测试。

## UI 一致性矩阵（UI 变更必需）

`screen/interaction | component/design token ref | existing pattern | variation (if any) | reason/approval | breakpoint | a11y | test evidence`

检查 Profile 版本、核心 tokens、导航、组件 API/变体、表格/图表语义、键盘焦点、对比度、横向溢出及适用的加载/空态/错误/权限/交互。优先引用实际组件和已有规则，例外须明确影响及批准，不逐页建立冲突样式。

## 架构与任务质量对齐

在早期依据 PA 高层规则与 SA 约束描述交互契约/假设，不等待 Module 最终 API；已确认 Figma 经 Master Handoff 给 Module 细化后，每个 UI 数据交互再对齐实施级 Feature Spec 和批准 API/schema/contract 版本、事件时机、状态和错误。原型使用合成数据/替身时明确模拟边界，不暗补产品规则或宣称后端集成已实测。无法支持的假设向 Architect 发送 CLARIFICATION_REQUEST；实质产品/契约变化交 Master/Owner，不静默重定义需求。

验收以代表性任务能否完成、用户能否理解信息/当前状态/下一步、决策与输入负担以及失败后能否恢复为依据。说明适用的可发现性、流程中断、反馈、权限拒绝与纠错结果，关联无障碍与 API/数据行为。页面/点击热点数量和视觉精细程度不能替代这些证据；功能自查/模拟走查、独立 DESIGN 审查和真实用户测试分别记录。

## 产物证据与交接

保留已有清单字段与分类（staged 增加上述 `figma-design` 等证据，不删除原字段）：`artifact_id | concept/high-fi/interactive | location | source revision | screenshot/video/build ref | actual test status PASS/FAIL/BLOCKED/NOT RUN | limitations`。设计源、渲染与行为证据分别说明：Figma 原型不是生产功能，渲染图片不是可编辑源，可点击原型也不证明用户测试已执行。

UI Designer 按[Agent Handoff](agent-handoff.md)交接主方案、PA 高层来源、精确 Figma/前端版本、方向反馈与确认、待决项和验证限制。Master 协调已确认 Figma 和 SA 基线到 Module 实施级规格的交接，以及原型与最终规格的重新对齐；不把早期 UI 输入错误绑定到尚未形成的详细规格。Master 核对 Design Gate；L/XL 与风险触发的 S/M 由独立 Reviewer 审查精确版本。重大设计/Profile 批准、设计完成、审查结论与有边界编码授权是不同事实，不能互相替代。

两阶段Module若消费staged L2的Figma，同样需要上述精确版本确认；仅作为待评审L2设计交付时可尚待确认，不得据此启动依赖它的正式细化。
