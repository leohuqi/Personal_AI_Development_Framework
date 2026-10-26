# 可裁剪架构设计方法

PADF 使用 C4 分层模型、轻量 arc42 关注点、架构决策记录（ADR）与风险裁剪；图表呈现复用[固定 Diagram-Design](../../integrations/diagram-design.md)。这是一份共用方法，现有 Solution Architect（SA）和 Module Architect（MA）按各自职责使用，不新增 Agent、阶段或审批。来源实际核验范围见 [sources](sources.md)，可读案例见[样例入口](../../examples/architecture-method/README.md)。

## 先复用，再选择深度

Master 同时记录项目规模 S/M/L/XL、当前 `architecture_scope`（none/module/system/both）、局部复杂度/外部依赖和实际风险。Profile 是独立的方法建议，不是 scope 的新值，也不是旧协议中的批准或就绪字段。不能从项目规模直接推出 Profile：XL 的局部表现变化可 Lite；S 的删除、权限、缓存同步或恢复变化也须增加相关设计和审查。

| Profile | 当前任务的证据 | 最小充分设计方向 |
| --- | --- | --- |
| Lite | 有有效批准基线、低复杂度、边界稳定、无新的数据/权限/恢复风险 | 复用基线；短说明目标/非目标、职责、状态、接口增量、异常、验收。无重大决定可无独立 ADR，不建多文件包 |
| Standard | 一般 Web/API 应用或有限跨模块变化，运行与依赖可明确说明 | Overview、Container、主要模块/公共接口；只有实际变化需要才增加部署、运行、数据及重大决定 ADR |
| Full | 多运行节点、复杂外部集成/数据权威或重要安全/恢复风险 | Overview、Context/Container、部署、代表运行/数据视图、关键 Component；安全/质量按风险；逐阶段细化模块和 ADR，不穷举所有 API 或 C4 Code |

先检查当前需求能否由既有批准设计覆盖；未知输入不静默按低风险 Lite。升级深度需说明“风险→补充视图/契约→验证”，例如权限变更补授权路径及拒绝场景，文件移动补跨资源恢复，缓存同步补版本和冲突，永久删除补保留/恢复与明确授权。小功能的行数或按钮大小不是风险证据。

## 与原门禁的兼容边界

[Architecture Design](../../contracts/architecture-design.md)、[Design Gate](../../contracts/design-gate.md)、现有路由及 G-01 的机器字段、必需产物、独立 DESIGN Review 和 Owner 权限保持原样。`system` 仍需要系统类型与架构图，`module` 仍需要模块组件图和批准 `system_baseline_ref`，`both` 保留顺序及 SHA 对齐。即使建议 Lite，也不能删除已触发的图、Review 或 Owner 批准。既有未变图可按原 Gate 允许的精确版本和有效证据复用；不能把“复用”写成无图豁免。

Lite 无新图仅适用于 `architecture_scope=none`，或原 Gate 允许的有效图/基线复用；[Lite 样例](../../examples/architecture-method/lite/DESIGN.md)选择前者。新方法可推荐额外 Review，但不把建议伪装成已实施的机器阻断。若希望今后让 material module design 无组件图，须单独分析兼容影响和取得所需决定；本轮不实现该放宽。Profile 选择不输出编码、合并、发布或部署许可。

## L0–L3 与一个长期入口

项目以 Architecture README 为日常入口，先解释当前/提案状态、系统做什么、主要取舍，再给按问题导航。目录可裁剪，同文件章节也有效。PADF 文档 L0–L3 是阅读组织，**不等同** C4 四种图层级。

| 文档层 | 回答的问题 | 责任与下钻 |
| --- | --- | --- |
| L0 Overview | 是什么、为什么、主要协作、关键风险与待决？ | SA；短正文+稳定导航，不复制接口全表 |
| L1 System | 系统边界、独立运行软件/存储、部署、跨模块关系/质量？ | SA；C4 Context/Container；按需 Deployment/Runtime/Data/Security |
| L2 Module | 谁负责、内部组件/接口、数据所有权、事务、错误和恢复？ | MA；批准系统基线内按当前模块深化，不重选平台 |
| L3 Implementation | 当前 Feature 具体输入输出、Schema/OpenAPI、状态/算法、可执行验收？ | MA 与实现角色；有界 Feature Spec，遵循批准系统/UI，编码另授权 |

C4 Container 是运行软件或数据边界，不等于 Docker；同进程逻辑模块画 Component，不画成多个独立服务。Deployment 表达 Container 实例的主机/环境放置，不重新定义逻辑模块。Runtime 是有序消息和分支；Data 明确是概念模型、逻辑模型还是物理 Schema。每图注明主题、范围/排除、抽象、权威来源、如何读及下钻。不能为统一层级把权限/恢复语义裁掉。

## 轻量 arc42 与决策

检查当前受影响的目标/约束、范围、策略/结构、运行、部署、跨切规则、决策、质量、风险及术语；内容放在有权威的位置，不强制填十二章或逐项空表。质量场景写刺激、环境、期望响应、验证办法和实际状态；容量估算/资料判断/实测分开。技术选择比较当前简单方案、现实替代、维护成本和重评条件。关键边界足以指导下一步后停止细化。

仅对结构、接口、依赖、安全/恢复或重要质量取舍建立 ADR。记录问题、上下文、备选、建议/决定、后果、状态、来源和真实批准；编号不复用，撤销保留旧记录并链替代项。不把文档接受、独立 Review APPROVE、系统技术批准、编码授权或上线混为一事。PROPOSED 不能因迁移或引用变 APPROVED。

## 单一权威与最小阅读

每项完整规则只有一个当前维护位置；摘要/导航允许重复但明确链接。简单项目无迁移冲突时不建 Source Map。确有跨版本迁移或复杂引用时按事实拆分：

| 来源状态 | 必须说明 |
| --- | --- |
| MIGRATED | 完整事实已迁到当前位置；原相同事实仅历史，不双向编辑 |
| NORMATIVE_REUSE | 完整事实仍在固定旧 SHA/章节；读者必须消费该范围，摘要不是替代 |
| HISTORICAL_ONLY | 只用于追溯的旧正文/Review/Handoff；不得覆盖当前规范或批准状态 |

“迁移状态”和“批准状态”独立。部分迁移必须拆事实，禁止声称完整迁移后把关键限制藏在历史里。当前正文与固定规范矛盾时停止受影响设计并由 Master 路由解决，不由读者任选一份。

| 角色/问题 | 默认最短资料 |
| --- | --- |
| Master：推进与决定 | Overview、重要 ADR/风险、待决与影响；核对 scope/基线/授权 |
| SA：系统改变 | 受影响 System View、跨模块接口/质量、相关 ADR |
| MA：模块深化 | 模块入口/契约、精确批准基线、依赖接口和适用已确认 UI；只下钻相关系统片段 |
| Coder/QA：实施和测试 | 批准 Feature Spec、模块接口/不变量、权限/失败恢复、验收；发现未知不猜测 |
| Reviewer：独立评价 | 精确 diff/源版本、批准需求、受影响权威与模型/图；执行审计按需 |

Handoff 给出问题→路径/章节→版本→状态，及未知/停止点。不强迫每人读完整模型、Glossary 或审计包。术语检查只加载相关词条，保护标识符、权限、错误及恢复含义，见[术语标准](../terminology/README.md)。

## 模型、呈现与验证

模型保存稳定节点/关系 ID、层级、职责/数据所有者、有序消息与条件，格式按复杂度选 JSON/Mermaid/DSL。Diagram-Design 负责呈现，不能为布局更改方向、权限或权威。项目 Visual Style Profile 不修改全局 Skill/个人 Profile；每次固定真实 Skill SHA、相关 refs、字体来源。先讲类型/尺寸/裁剪计划，再生成静态自包含 HTML；按任务需要导出 SVG/PNG。

实际浏览器渲染后检查文字边界、连线/遮挡、放大、窄屏局部滚动、字体与离线请求；逐图看预览，核对模型节点、边、顺序和分支。ID 集合/几何 PASS 不证明行为正确，须读语义。记录生成、导出、浏览器、实看、内容核验的独立结果与输入 hash；没有能力标 BLOCKED/NOT RUN，不能凭 SVG 文件存在声称通过。下游 Reader 对照保留同任务/预算、精确源、独立真实答案与遗漏；没有可比实测不宣称 Token/耗时节省。

## 自动建议的调用

`node scripts/recommend-architecture.mjs assessment.json` 调用[只读选择器](../../lib/architecture-profile.mjs)。输入沿用当前任务分类、scope、impacts与risk_flags，并补本轮复杂度、基线状态、受影响运行单元/依赖数量及来源冲突线索；缺证据时保守建议Standard，严重复杂度建议Full。数量阈值是可说明的默认启发，不是新协议或所有项目的硬性标准。输出理由、建议视图及原路由的Review要求；Master核对实际风险和范围后使用，不能把建议冒充设计就绪或授权。
