# 个人 AI 开发框架（PADF）

**当前版本：v0.3.6（V0.3 系列）。** 本版新增可裁剪架构设计、通用术语治理和 Agent 接续规则，保留原设计门禁、授权及项目独立采用边界。参见[v0.3.6 版本说明](docs/releases/v0.3.6.md)与[GitHub Release](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.3.6)。

[完整更新历史](CHANGELOG.md)汇总各正式版本及 V0.1 历史基线；发布后同步维护，详细证据保留在各版本说明和 Release 中。

PADF 定义由 Owner 决策、Agent 执行的增量软件开发流程。每个应用维护自己的 PRD、架构、UX 基线、功能目录、源码、AGENTS.md 与 CI；框架可供不同项目复用。

## v0.3.5：UI 原型流程

高层原型采用概念图；Owner 或获授权团队成员确认准确版本后，直接用批准前端栈制作高保真交互 Mockup，并依据[Impeccable](integrations/impeccable.md)审查任务体验和一致性。Figma 不再是必需产物。L1 为概念草稿，L2 为已确认概念，L3 为前端 Mockup；新旧模式都核对概念确认、原型授权和当前审查，迁移字段见[UI 契约](contracts/ui-design.md)。已发布历史 tag 不回写，重大决定/编码/生产门禁不变。

## 小团队协作与简化工作方式

Owner / PM 保留最终决定，1–2 名技术成员可兼技术、开发、接口联测和获批准部署的执行职责；Master 协调人和 Agent。角色不等于人数，不为普通任务启动全部角色或复制多份文档。

从[小团队协作入口](workflow/small-team-collaboration.md)开始：Task Contract 只先写六项任务信息，Handoff 回答六个交接问题；机器协议/执行证据按需附在原记录。所有角色遵循不过度设计：只补当前验收/风险所需内容，复用基线，足以实施/验证即停止；项目文档、评审和日常沟通同样遵循[最小充分规则](workflow/role-work-method.md#文档评审与沟通同样最小充分)：结论/请求先行，更新原文并用链接复用，技术和审计按需展开；人工评审可用[短卡片](templates/stage-delivery.md)。必要门禁仍适用。

协作方式参考 BMAD，复用现有工具，不新增插件安装或服务部署。接入项目仍须批准并固定所采用的版本，不随 PADF 发布自动升级。

## v0.3.6：可裁剪架构、术语治理与 Agent 接续

架构采用[可裁剪统一方法](standards/architecture/README.md)：Master按当前范围、复杂度与风险选择Lite/Standard/Full，SA与Module按C4、轻量arc42和ADR组织设计，各角色从单一权威入口按问题读取。[架构样例与8张实绘图](examples/architecture-method/full/README.md)保留源模型、HTML、SVG、PNG及真实渲染证据。

[术语标准](standards/terminology/README.md)和[共享Skill](.agents/skills/terminology-governance/SKILL.md)按需检查Business、Architecture、Engineering、AI、PADF Governance及项目术语。词条状态与证据强度显式保留；辅助器不自动替换、不把文字检查当语义验证。

同一项目与职责优先继续已有Agent处理后续变化；无法接续或独立性不满足时，从准确成果恢复并只补变化。接续仍核对当前授权、Task Contract、版本、真实执行和独立审查，详见[共用接续规则](workflow/agent-protocol.md#优先接续已有-agent)。Profile建议、术语检查和会话接续均不能绕过原Design Gate、G-01或Owner权限。

## v0.3.4：设计证据与执行依赖完整性

修复所有规模已知 Review 拒绝/严重发现漏检，逐项核对全部必需架构阶段；正式编排绑定当前任务、精确产物和获批基线/Profile，并按完整阶段依赖图核对实际先行与运行时依赖。legacy/staged UI 的等级、高保真及交互证据保持一致，G-01 编码门禁继承阻断。旧正式输入与 legacy L2/L3 的补证要求见[v0.3.4 接入说明](docs/releases/v0.3.4.md#接入与补证)。修复不自动升级其他项目或授予操作权限。

## v0.3.2：批准范围内的持续分派

Master 复用有效 Owner 授权与精确 Task Contract，优先调用可用真实 Agent 运行时，无需逐次重新批准；每次启动仍核对范围、环境、角色/动作、必要决策和依赖，并保留 Dispatch、工具执行 ID、Handoff 与协调记录。越界、授权撤销、必要批准缺失或未授权编码等操作仍阻断。重大设计决策、业务编码、合并、发布、生产部署、破坏性操作与最终验收保留各自授权门禁，参见[审批策略](governance/approval-policy.md)和[Dispatch 契约](contracts/agent-dispatch.md)。

## v0.3.3：产品定义、完整方案与整体质量

v0.3.3 包含以下能力：PA负责High Level Specs/Catalog；SA技术初评、五级实现复杂度和完整系统方案；Master结合功能关系规划milestone/iteration并协调Handoff；Module Designer结合SA与已确认UI细化实施级Feature Spec。v0.3.3 当时采用概念图→Figma确认→前端原型，当前UI流程见上方v0.3.5；QA交Test Cases与Test Results；Context Coordinator是共享恢复能力，进度归Master；已有明确规格与局部改动直接复用。

九个角色按[成果标准](contracts/role-deliverables.md)裁剪；[共用工作方法](workflow/role-work-method.md)统一补输入/研究/复用，[Agent 协议](workflow/agent-protocol.md)集中消息与交接，仅在相关动作前加载。机器字段用本地草稿生成器辅助，不增加审批权或运行时服务。

[Owner统一评审入口 #14](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/14)：成果、推荐和待决项集中查看，可在入口评论或PADF对话反馈；Master同步真实结论及版本，验收/合并/发布分别记录。

## 文档语言

核心入口、9 个角色 Skill 与术语共享 Skill 以中文说明为主，便于需求确认、审查与日常维护。Skill 名称、角色英文术语、文件路径、命令、YAML/JSON 字段、schema 标识及状态枚举保留英文，以保持工具兼容和协议可验证性。后续更新沿用同一份正文，不默认维护重复的中英文版本；技术契约中的既有标识与历史证据不因翻译而改版。

## 核心流程

```text
Owner ↔ ChatGPT/Work 主协调者（Master）
   ↓ 已批准的 PRD / Feature Spec / UI 与架构
Linear Free：路线图、任务、优先级、阻塞、Cycle
   ↓ Owner 明确授权的 Codex 任务
功能开发者 → GitHub PR → GitHub Actions + QA 验证
                          ↘ 独立审查
                          ↘ 失败则返工
   ↓ 可核验证据 + 适用的 Owner 验收
Linear Done / 下一项人工授权的功能
```

## V0.2：上下文与 Agent 通信（CACF）

跨 ChatGPT、Work 和 Codex 会话的连续性通过共享任务上下文（Shared Task Context）、类型化持久消息（Agent Message）、检查点（Context Checkpoint）及可核验交接（Agent Handoff）实现。GitHub 管理代码、批准规格和 ADR，Linear 管理实时任务与依赖，Owner 批准受保护的决定。消息或检查点本身不授予权限、不唤醒 Agent，也不证明测试通过。

- [上下文通信流程](workflow/context-communication.md)
- [共享任务上下文](contracts/shared-task-context.md)
- [Agent Message 契约](contracts/agent-message.md)
- [检查点与恢复契约](contracts/context-checkpoint.md)
- [Agent Handoff 契约](contracts/agent-handoff.md)
- [上下文治理](governance/context-governance.md)
- [PQA 接入示例](examples/pqa/CONTEXT-COLLABORATION.md)

**能力边界：** V0.2 提供 Skill、消息契约及由人工或实际运行时启动的流程；不随仓库启用 A2A 服务、消息代理、常驻调度器、新数据库、自动分派或实时通知。真实集成与送达依赖已连接工具及获授权任务。

## V0.3：专业设计角色与设计门禁

[Solution Architect](.agents/skills/solution-architect/SKILL.md)负责应用整体技术栈和架构基线；[Module Architect](.agents/skills/module-architect/SKILL.md)在批准系统基线下负责模块代码、包与接口详细设计。两者按要求使用固定版本的外部 [diagram-design](integrations/diagram-design.md)，提交与权威源模型一致的架构、流程和数据结构图。

[UI/UX Designer](.agents/skills/ui-ux-designer/SKILL.md)根据各项目的 [UI Profile](contracts/project-ui-profile.md)，产出设计理念、概念、高保真画面，以及风险所需的交互原型；不会为所有项目强制统一视觉风格。

Master 负责[能力路由](workflow/agent-routing.md)、[阶段依赖](contracts/agent-dependency.md)与 [Design Gate](contracts/design-gate.md)。采用治理模型 C：L/XL 和风险触发的 S/M 需要独立 DESIGN 审查；Master 管内容充分性、整体一致性和流程就绪，Reviewer 独立判专业质量，Owner 批准重大决定与编码。设计者沿用 [V0.2 Handoff](contracts/agent-handoff.md)，接收方 ACK 或 NEEDS_REFINEMENT，不新增编码调度器或 Agent 守护进程。

- [设计协作流程](workflow/design-collaboration.md)
- [系统架构基线](contracts/solution-architecture.md)、[模块设计](contracts/module-design.md)、[架构包选择](contracts/architecture-design.md)、[UI 设计包](contracts/ui-design.md)
- [固定版本图表工具集成](integrations/diagram-design.md)、[依赖与门禁评估器](lib/design-gate.mjs)

[PADF v0.2.0](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.2.0) 仍是不可变历史发布。项目采用 V0.3 时须另行批准并固定精确 commit/tag，不能仅凭框架 PR 合并推定接入完成。

## 真实编排与专家质量验收

按[真实 Master 编排手册](workflow/master-orchestration-validation.md)执行时，Owner 仅提供业务目标，Master 在专家开始前发布[Dispatch Record](contracts/agent-dispatch.md)。随后须有真实执行回执、专家 Handoff 和 Master 实时依赖协调，明确区分：

- ROLE_SIMULATION：同会话角色模拟。
- HUMAN_RELAY：Owner 依据分派链接启动独立会话。
- RUNTIME_DISPATCH：Master 通过实际工具启动并获得真实任务 ID。

Owner 按[专家质量评价契约](contracts/skill-delivery-evaluation.md)分别评价三位设计专家，关联真实会话、不可变产物与 Skill SHA。截图不等于可运行原型；有图不等于实际调用过外部图表 Skill。

[Issue #5](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/5) 已完成；有边界的 V0.3 Expense Ledger 设计试点已记录 [Owner 验收](examples/issue-5-acceptance/OWNER-V0.3-ACCEPTANCE.md)与[Master 验收协调](examples/issue-5-acceptance/MASTER-OWNER-ACCEPTANCE-RECONCILIATION.md)。交付包与架构交互图入口见[试点目录](examples/issue-5-acceptance/README.md)。验收保留证据记录中的限制，不代表原生应用、设备、持久化、GPS、真实服务商或生产行为已验证。[Issue #4](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/4) 保留为历史角色模拟示例。

只读脚本仍然只检查合成证据元数据：

```bash
node tests/v0.3/run-orchestration-tests.mjs
node tests/v0.3/run-skill-quality-tests.mjs
node tests/v0.3/run-product-tests.mjs
node tests/v0.3/run-feedback-tests.mjs
node tests/v0.3/run-concept-mockup-tests.mjs
```

这些脚本通过不等于实际跨会话执行、外部工具调用、独立 DESIGN 审查或 Owner 评分；真实结果以精确证据和批准记录为准。

## 9 个角色 Skill 与共享能力

| Skill | 主要职责 |
| --- | --- |
| [master-orchestrator](.agents/skills/master-orchestrator/SKILL.md) | 范围、设计协调、任务就绪、冲突路由与验收组织 |
| [product-analyst](.agents/skills/product-analyst/SKILL.md) | 产品定义、任务研究、High Level Specs/Catalog及优先级建议 |
| [context-coordinator](.agents/skills/context-coordinator/SKILL.md) | 最小共享上下文、持久消息、检查点、恢复与交接 |
| [solution-architect](.agents/skills/solution-architect/SKILL.md) | 应用级技术栈、系统架构、代码骨架、ADR 与图表 |
| [module-architect](.agents/skills/module-architect/SKILL.md) | 已批准系统基线内的模块包、接口、流程与测试设计 |
| [ui-ux-designer](.agents/skills/ui-ux-designer/SKILL.md) | 项目一致的设计理念、UI 概念、原型及交互契约 |
| [feature-coder](.agents/skills/feature-coder/SKILL.md) | 获授权的实现、测试与 PR 交付 |
| [qa-tester](.agents/skills/qa-tester/SKILL.md) | 验收用例、集成/E2E 验证与测试证据 |
| [independent-reviewer](.agents/skills/independent-reviewer/SKILL.md) | 独立新上下文、精确 PR diff 与风险审查 |

另有 [terminology-governance](.agents/skills/terminology-governance/SKILL.md) 共享能力，按需使用，不增加角色或审批。

九个角色 Skill 共享同一份 Agent Message 模板与草稿生成器，首次相关动作前必须读取共用协议；字段沿用 `padf.agent-message/v1`。

- [开发工作流与质量门禁](workflow/WORKFLOW.md)
- [Task Contract](contracts/task-contract.md)与[Delivery Report](contracts/delivery-report.md)
- [审批策略](governance/approval-policy.md)与[上下文加载策略](governance/context-loading.md)
- [角色路由](workflow/agent-routing.md)
- [PR 模板](templates/pull_request_template.md)
- [PQA 接入示例](examples/pqa/ADOPTION.md)

## 验证

克隆仓库后可运行无需第三方依赖的结构和回归检查：

```bash
node scripts/validate-cacf.mjs
node scripts/build-glossary.mjs --check
node tests/vnext/run-profile-tests.mjs
node tests/vnext/run-terminology-tests.mjs
python3 examples/architecture-method/tools/check.py
python3 tests/vnext/run-diagram-source-tests.py
node tests/cacf/run-validation.mjs
node tests/cacf/run-regressions.mjs
node tests/v0.3/run-tests.mjs
node tests/v0.3/run-orchestration-tests.mjs
node tests/v0.3/run-skill-quality-tests.mjs
node tests/v0.3/run-product-tests.mjs
node tests/v0.3/run-feedback-tests.mjs
node tests/v0.3/run-concept-mockup-tests.mjs
node tests/v0.3/run-preflight-tests.mjs
node tests/v0.3/run-review-integrity-tests.mjs
node tests/v0.3/verify-expense-pilot.mjs
```

结构检查覆盖必需文件、本地 Markdown 链接、schema 标识和角色集成；其余脚本验证受限测试夹具与元数据，不证明线上 Linear/GitHub 消息送达、自动分派、外部工具集成或真实多会话恢复。

## 项目接入

1. 审阅并批准精确 PADF commit/tag。
2. 将批准的 `.agents/skills/` 与所引用契约、工作流、治理和集成文件一并复制或固定到接入仓库，保持相对目录结构；也可由支持的环境访问完整固定版本。只复制单个 SKILL.md 会丢失契约链接。
3. 接入项目维护精简且项目专属的 AGENTS.md，仅加载相关功能规格和技术契约。
4. 分别配置 Linear/GitHub 集成、GitHub Actions 和 Codex Automatic Review；提交 Skill 文件不会启用这些产品。
5. 每个授权开发任务使用 Task Contract，以 STC 索引来源和消息，以 Delivery Report 提供 QA、审查证据及 Owner 验收。
6. 重要跨角色沟通保留类型化消息与永久链接，跨会话/角色前建立检查点，恢复时核对实时来源。
7. Skill 不提供循环调度服务，Linear Free 不会持续分派 Codex 任务；此流程无需自建常驻服务。

框架维护不自动修改其他项目。PQA 的领域规则与既有 PR 边界位于 [PQA 专属规则](examples/pqa/AGENTS.md)，接入或更改须另获授权。

**不在 V0.3 范围内：** Feature Planner/Designer、Iteration Manager 专属 Skill，以及任何并行执行运行时。

## G-01：Master主动治理（v0.3.3）

操作前预检覆盖合并、编码、发布、生产部署、Owner验收和Issue Done；Owner请求不隐式豁免必要门禁。见[设计与现状分析](docs/governance/G-01-design.md)、[契约](contracts/action-preflight.md)、[操作手册/平台限制](workflow/action-preflight.md)、[历史流程例外](docs/governance/PQA-PR7-process-exception.md)及[验收模板](templates/action-preflight.md)。

只读评估器不认证远端权限、不执行操作或提供服务器强制拦截；本地验证：`node tests/v0.3/run-preflight-tests.mjs`。G-01 已经独立 PR、Review 和 Owner 验收，与角色成果优化一并纳入 v0.3.3；后续 Release 仍须单独授权。
