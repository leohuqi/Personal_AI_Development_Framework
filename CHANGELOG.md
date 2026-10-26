# 更新日志

按版本记录 PADF 的主要能力、修复和接入变化，最新版本在前。正式发布以不可变 tag 和 GitHub Release 为准；日期采用 `published_at` 转换后的北京时间（Asia/Shanghai），不是 PR 合并时间。各版本的完整发布说明、精确审查和验收证据继续保留在原始来源中。

## 未发布

- Master进度协调修复：准确区分父CR与执行Issue，在有意义节点核对状态、依赖、实际写入和回读，并保存可验证同步回执；新执行入口阻断缺失/失败回执，旧合同兼容及原G-01/Owner Done边界保留。见[修复与验证入口](docs/enhancements/progress-reconciliation/README.md)。

## 版本总览

| 版本 | 发布日期（北京时间） | 主题 | 发布提交 |
| --- | --- | --- | --- |
| [v0.3.6](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.3.6) | 2026-10-26 | 可裁剪架构、术语治理与 Agent 接续 | [不可变发布标签](https://github.com/leohuqi/Personal_AI_Development_Framework/tree/v0.3.6) |
| [v0.3.5](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.3.5) | 2026-10-24 | 小团队简化、概念 Mockup 与文档评审 | [不可变发布标签](https://github.com/leohuqi/Personal_AI_Development_Framework/tree/v0.3.5) |
| [v0.3.4](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.3.4) | 2026-10-23 | 设计证据与执行依赖完整性 | [3afcb5b4](https://github.com/leohuqi/Personal_AI_Development_Framework/commit/3afcb5b4b038656f50bab57f4722b4a3f3accda7) |
| [v0.3.3](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.3.3) | 2026-10-21 | 角色成果优化与 Master 主动门禁 | [8a1fa814](https://github.com/leohuqi/Personal_AI_Development_Framework/commit/8a1fa8142c2a7304f8c5f2978fa557437a8942f6) |
| [v0.3.2](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.3.2) | 2026-10-21 | 批准范围内的持续分派 | [15866db0](https://github.com/leohuqi/Personal_AI_Development_Framework/commit/15866db0cf09c5ac5d44b5bdb5c62e311c553ee2) |
| [v0.3.1](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.3.1) | 2026-10-20 | 设计门禁安全修复 | [47e96a09](https://github.com/leohuqi/Personal_AI_Development_Framework/commit/47e96a09c2e40330b4e3a15042c38651b988cd71) |
| [v0.3.0](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.3.0) | 2026-10-20 | 专业设计协作与中文核心文档 | [c55b63bc](https://github.com/leohuqi/Personal_AI_Development_Framework/commit/c55b63bc6b48c964548fd62d550d79f5d7a642b1) |
| [v0.2.0](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.2.0) | 2026-10-13 | 共享上下文与 Agent 通信（CACF） | [c2caac0a](https://github.com/leohuqi/Personal_AI_Development_Framework/commit/c2caac0a6eac220f65667b7fe7cd5e6943dbe807) |

V0.1 是发布前的历史基线，见文末；仓库没有独立的 V0.1 tag 或 Release，不将其补记为正式发布。

## v0.3.6 — 2026-10-26

- **架构设计：**新增按范围、复杂度与风险选择 Lite/Standard/Full 的统一方法，以 C4、轻量 arc42 和 ADR 组织系统、模块、运行、数据与决策；角色按问题读取单一权威来源。
- **可视化证据：**提交 8 张架构图的源模型、HTML、SVG 与 PNG；真实浏览器渲染、逐图实看和独立复渲染均已完成，修复 Standard 组件图父容器标注问题。
- **术语治理：**新增六领域单源词表、共享 Terminology Governance Skill、生成与保护检查；通用词条保持 `PROPOSED`，辅助器只提供有界提示，不自动替换或宣称语义等价。
- **Agent 接续：**同一项目、职责与有效授权范围优先继续已有 Agent；不可接续时从准确成果恢复，只补变化，同时保留当前授权、版本、真实执行及独立审查要求。
- **兼容性：**原机器协议、Design Gate、G-01、UI 流程和 Owner 授权边界保持；Profile 只读建议不能提供缺失角色、批准、图表或审查。

接入项目须阅读[版本说明](docs/releases/v0.3.6.md)，批准并固定采用版本；PADF 发布不会自动升级 PKMS、PQA 或其他项目。来源：[PR #24](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/24)、[PR #25](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/25)及[Owner评审中心](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/14)。准确发布提交由不可变 tag 解析。

## v0.3.5 — 2026-10-24

- **协作与沟通：**明确2–3人团队职责，精简任务/交接；全部角色遵循不过度设计/编码，文档与评审结论/请求先行、单份维护、链接复用。
- **UI流程：**取消强制Figma，改为概念图→Owner或获授权成员确认→前端交互Mockup→Impeccable审查与修正。
- **修复：**当前Impeccable报告的失败或未处置发现不因报告/阶段可选而被忽略，Design Gate与START_CODING均阻断严重问题。
- **历史维护：**纳入v0.3.4之后补记的各版本中文更新历史；保留旧版本说明和标签。

接入需按[版本说明](docs/releases/v0.3.5.md#接入与迁移)同步UI字段、契约和Skill；staged/省略模式也执行新规则。重大决定、编码、合并、发布和生产授权不变。来源：[PR22](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/22)；准确发布提交由上方不可变tag解析，避免预填尚未产生的最终合并SHA。验证、限制及回退统一见版本说明。

## v0.3.4 — 2026-10-23

### 修复

- 已提供的 DESIGN Review 对所有任务规模生效；拒绝、未修复 P0/P1、未接受 P2 及畸形发现阻断，低风险跳过不能覆盖已有结果。
- 逐一核验全部必需 SA/Module；both 使用唯一精确获批系统基线来源，数据库/流程证据按任务级产物集合核验，消除首项与清单顺序依赖。
- 正式编排绑定当前任务、仓库、契约、各阶段 Dispatch/Execution、全部必需精确产物，以及获批基线/Profile 输入。
- 沿完整阶段图穿过协调节点核对所有专业祖先的真实先行与运行时依赖；保留一般传递依赖、合法清单重排和 module-only 外部获批基线复用，both 的系统来源仍需直接依赖。
- legacy/staged 均校验合法 UI 等级；legacy L2/L3 补可编辑高保真源，L3 另需交互证据。G-01 START_CODING 继承阻断，null 正式链明确返回证据不足。

### 接入变化

旧正式编排输入及 legacy L2/L3 须按说明补证，缺证据明确 BLOCKED；未开启正式编排验证的路径不新增绑定要求。316 项新增注册检查及既有检查通过；原实现源另有 9,231 项独立有界图/边界检查，这些不是实际产品或 Agent 试点。

来源：[版本说明](docs/releases/v0.3.4.md) · [PR #19](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/19) · [发布文档 PR #20](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/20) · [完整差异](https://github.com/leohuqi/Personal_AI_Development_Framework/compare/v0.3.3...v0.3.4)。

## v0.3.3 — 2026-10-21

### 新增与调整

- 新增 Product Analyst，负责 High Level Specs 与 Catalog；Module Designer 结合获批系统方案和适用已确认 UI，细化实施级 Feature Specs，由 Master 协调 Handoff/ACK。
- SA 提交完整系统方案及 Very High/High/Medium/Low/Very Low 五级实现复杂度；Master 结合价值、功能关系、依赖和风险规划 milestone/iteration。
- UI 按概念图 → Figma 设计/精确确认 → 已授权前端栈下的高保真交互原型逐步收敛；Module 可先消费已确认 Figma。
- QA 交付可追溯 Test Cases 与逐版本 Test Results；Context Coordinator 提供共享上下文/恢复，进度与整体交付质量归 Master。
- 共用研究、消息和交接规则集中维护，新增 Owner 统一评审入口。

### 治理门禁

新增 G-01 主动操作预检，覆盖合并、启动编码、发布、生产部署、Owner 验收和 Issue Done；执行前实时复核，合并原子匹配 HEAD，八类生命周期事实分别记录。Owner 请求不隐式豁免 Review/CI/QA/依赖；原有效范围内分派无需逐次批准。两阶段规格与 staged UI 作为兼容扩展，旧格式不得冒称完成新流程。

来源：[版本说明](docs/releases/v0.3.3.md) · [PR #13](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/13) · [PR #16](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/16) · [发布文档 PR #17](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/17) · [完整差异](https://github.com/leohuqi/Personal_AI_Development_Framework/compare/v0.3.2...v0.3.3)。

## v0.3.2 — 2026-10-21

### 调整与修复

- Master 在已批准范围和精确 Task Contract 内，使用现成真实 Agent 运行时持续分派、启动与接续，无需新增逐次 Owner 批准。
- 增加只读 `evaluateDispatchAuthorization`，逐次核对上下文、仓库、环境、范围项、角色/动作和必要 SYSTEM/UI 决策的精确版本。
- 授权撤销、越界、缺少必要批准或未授权编码等保留操作仍阻断；分派授权不扩展为重大决定、合并、发布、生产或最终验收。
- 修复合法 Context Coordinator 的 COORDINATE 任务被误阻断；保留 Dispatch → 独立 Execution → Handoff → Master 协调及真实工具执行 ID。

### 接入变化

沿用既有 v1 契约，新增可选 `padf.dispatch-authorization/v1` 快照；旧证据不能自动变成有效授权，不新增后台调度器。Release 的 UTC 发布时间为 2026-10-20T16:03:59Z，换算北京时间已是 10 月 21 日。

来源：[版本说明](docs/releases/v0.3.2.md) · [PR #10](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/10) · [发布文档 PR #11](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/11) · [完整差异](https://github.com/leohuqi/Personal_AI_Development_Framework/compare/v0.3.1...v0.3.2)。

## v0.3.1 — 2026-10-20

### 修复

- 已知模块影响必须路由 Module Architect，显式 system/none 不能排除模块职责；系统与模块影响同时存在时要求 both。
- S/M 强制 DESIGN 审查同时依据 impacts 和 risk_flags，不能通过漏填风险标签跳过已知高风险影响。
- UI Profile 须具备 APPROVED 状态、Owner 批准来源和精确版本绑定；草稿、固定 SHA 或编码授权本身不能代替批准。
- 缺少必需 UI 阶段时以 MISSING_UI_DESIGN_STAGE 阻断；所有必需 UI 阶段逐一核验 Profile、规格、视觉及适用 L3 原型。

### 接入变化

schema 仍为 v1，但此前错误放行的输入现在阻断；UI 根层批准字段和各阶段 Profile 须精确匹配，不能默认补成 APPROVED。本版包含 v0.3.0 发布后已合并的必需 UI 阶段修复。

来源：[迁移说明](docs/releases/v0.3.1.md) · [PR #8](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/8) · [PR #9](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/9) · [完整差异](https://github.com/leohuqi/Personal_AI_Development_Framework/compare/v0.3.0...v0.3.1)。

## v0.3.0 — 2026-10-20

### 新增与调整

- 专业设计协作正式进入 V0.3：新增 Solution Architect、Module Architect、UI/UX Designer，与原有角色组成当时的 8 个核心 Skill。
- 区分系统架构与模块详细设计；按影响和风险路由专家，提交有版本及证据的架构/UI 设计包、图表、项目 UI Profile 和交互原型。
- 引入 Design Gate、阶段依赖、独立 DESIGN/IMPLEMENTATION 审查及单独 Owner 编码授权、最终验收。
- 建立可审计 Dispatch → Execution → Handoff → Master 协调记录及设计专家质量评价；README、AGENTS 和核心 Skill 中文化，规范通用审查词汇、项目规则隔离与消息模板。
- Issue #5 的 Expense Ledger 设计试点获有边界 Owner 验收；不等同真实应用或生产行为已验证。

### 接入变化

沿用 V0.2 通信契约与 `padf.*/v1` 协议；专家设计就绪不授予编码或部署权限。后续版本进一步修复门禁漏检，接入方应审阅相应补证说明。

来源：[正式 Release](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.3.0) · [PR #6](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/6) · [PR #7](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/7) · [完整差异](https://github.com/leohuqi/Personal_AI_Development_Framework/compare/v0.2.0...v0.3.0)。

## v0.2.0 — 2026-10-13

### 新增与修复

- 新增 Context Coordinator；以 Shared Task Context 索引权威任务材料，支持跨会话最小上下文、消息持久化、检查点/恢复及可核验 Handoff。
- 建立 Agent Message 的消息/线程 ID、关联响应、状态、幂等重试及来源优先级；Git/spec 变更或必要批准缺失时停止恢复。
- 增加结构检查、跨进程协议夹具、回归与 GitHub Actions；修复测试目录所有权和消息/回复重试生命周期问题。
- L3 有边界试点演示持久消息、关联响应、checkpoint 和 QA Handoff；历史会话身份独立核验仍为 BLOCKED / owner-attested，不能写成全面端到端通过。

### 接入变化

提供 Skill、契约、文档和验证工具，不自带常驻运行时、自动送达/唤醒、A2A 服务、数据库、自动合并或生产部署。实时 Linear 传输和 PQA 接入仍需单独授权。

来源：[版本说明](docs/releases/v0.2.0.md) · [PR #1](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/1) · [正式 Release](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.2.0)。

## V0.1 历史基线（非独立发布）

基线提交日期：2026-10-12（北京时间）。[提交 8a4136aa](https://github.com/leohuqi/Personal_AI_Development_Framework/commit/8a4136aa791ed58f40a8be3258d5827415857503)以 V0.1 名称建立框架，但未创建对应独立 tag/Release。

- 建立 Master Orchestrator、Feature Coder、QA Tester、Independent Reviewer 四个可复用核心 Skill。
- 建立 Task Contract、Delivery Report、开发/QA/独立审查流程及明确 Owner 授权、验收边界。
- 隔离通用框架与项目专属规则，要求接入项目保有自己的规格、架构、源码、AGENTS 和 CI；平台集成另行配置。

来源：[当时的 README](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/8a4136aa791ed58f40a8be3258d5827415857503/README.md)。

## 维护方式

发布后按真实 tag/Release 补齐对应版本的日期、主要变化、兼容/迁移影响及来源链接；尚未发布的工作保留在“未发布”下。不得把主分支变化倒写为旧 tag 已包含的内容，不移动历史标签，也不把合成检查、CI、Owner 验收和真实业务/生产执行混作同一事实。
