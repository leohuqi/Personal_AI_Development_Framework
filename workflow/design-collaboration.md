# Specialized Design Agent Collaboration — PADF V0.3

当前成果标准见[角色主成果](../contracts/role-deliverables.md)与[共用工作方法](role-work-method.md)。Master 对内容充分性、整体一致性和整合建议负责，独立 Reviewer 和 Owner 权限不变。PA先出High Level Specs/Catalog，SA评复杂度、Master规划，Module结合SA与已确认UI细化实施级Spec并Handoff；UI按概念图→Owner/获授权团队成员确认→前端交互 Mockup 与 Impeccable 审查。消息、执行和交接按[共用协议](agent-protocol.md)按需读取，主成果在前、审计为附录，简单增量不重复完整试点。

**Role-based sequential workflow, not parallel execution orchestration.** This document extends [WORKFLOW.md](WORKFLOW.md) and [CACF V0.2](context-communication.md); existing Task Contract, Agent Message, Checkpoint and Handoff remain in force.

## Stage selection
Master 先核对产品输入，缺少或变化时路由 Product Analyst，已有有效规格则复用；确定 product_scope，再结合已批准功能规格、S/M/L/XL、风险与受影响边界进行[角色路由](agent-routing.md)。
- S: code-only bug normally goes Coder -> tests -> risk-based review; no invented architecture/UI package.
- M: invoke Module Architect if a module's API/schema/workflow or internal code structure needs design against an approved system baseline; Solution Architect only for APP-wide technology/boundary changes; UI Designer for UI/interaction.
- L/XL: invoke relevant designers **and mandatory independent DESIGN review**, even if only one design domain is affected; large task size alone never forces Solution Architect.
- High-risk S/M: mandatory independent DESIGN review (auth/permissions/privacy, destructive schema, breaking API, critical rules/workflows, shared design-system/component, complex integration etc.).
- No need to launch Architect/UI simultaneously: order by dependency. Early UX concept may precede Architect when it drives API requirements; Architect may first constrain feasible UI.

## Phases and owners
| Phase | Producer / owner | Evidence / criteria |
| --- | --- | --- |
| Product definition (when needed) | Product Analyst | 产品/旅程、High Level Specs/Catalog、业务验收/优先级；SA补复杂度、Master划实施切片，Module细化实施级规格，复用有效规格可跳过 |
| Feature/classification | Master | Approved spec, product_scope, class S/M/L/XL, risks and routing reason |
| System Architecture | Solution Architect | [Solution Architecture Baseline](../contracts/solution-architecture.md): tech stack, whole-app system/module boundaries, high-level code topology, diagrams |
| Module Code Design | Module Architect | [Module Design Package](../contracts/module-design.md): approved system baseline ref, module packages, signatures/contracts, tests and component/sequence/schema diagrams |
| UI/UX | UI Designer | [UI Package](../contracts/ui-design.md), project [UI Profile](../contracts/project-ui-profile.md) + concept/high-fi/interactive level |
| Design Handoff | Producing Architect/Designer | V0.2 [Agent Handoff](../contracts/agent-handoff.md), manifest, exact refs; receiving agent ACK / NEEDS_REFINEMENT |
| Dependencies | Master | [Stage Dependency](../contracts/agent-dependency.md) checks completeness and stale revisions, unresolved blockers |
| Independent Design Review | Independent Reviewer (DESIGN mode) | Required L/XL and high-risk S/M; exact artifacts; P0-P3 independent findings |
| Design Consistency Gate | Master | [Gate](../contracts/design-gate.md) decides DESIGN_READY or BLOCKED using evidence, not self-review |
| Coding authorization | Owner | Separate bounded approval + Task Contract; DESIGN_READY alone does not start coding |
| Implementation | Coder -> QA -> Implementation Reviewer | Existing PADF V0.2 controls remain; exact PR head evidence |

## Architectural and UI agreement
- Every Module Design must refer to the approved system baseline at exact revision; changed stack/global boundary is a Solution Architect/Owner decision, never silent module redesign. In scope `both`, complete/approve SYSTEM before MODULE and record the dependency.
- Each UI data interaction must cite approved API schema/version and error cases; Architect responds through durable CLARIFICATION_REQUEST/RESPONSE for ambiguities. 
- Revisions to approved business/architecture/UX baselines require Owner approval, then update canonical GitHub spec/ADR/profile and invalidate dependent stale artifacts.
- Master checks for unresolved contradictions; Reviewer checks consistency independently where required, not through Design Agent self-certification.
- No owner-approved deviation? Follow existing project tokens/components and architecture; do not use a generic visual style on every new screen.

## Gate outcomes
- DESIGNED / COMPLETED by producer: **not automatically APPROVED**.
- For mandatory independent review, lack of exact revision-matched independent review -> BLOCKED, even if Owner endorses UX.
- Gate DESIGN_READY is readiness only. Coder needs separately recorded owner authorization; no automatic dispatch or new runtime.
- A revised architecture/schema/UI profile means related stage and gate need revalidation; avoid unnecessary redoing unaffected artifacts. No last-write-wins or silent waiver.

## Example (illustrative)
An M-level UI-only edit with no shared-component or other mandatory review risk: UI Designer may produce L2 source pinned to project UI profile, Master checks consistent tokens/behavior, records review skip reason, obtains separate Owner coding authorization. An L-level strategy/stock-detail change with API/UI effects in an **existing approved system**: Module Architect produces package/interface+component diagrams, UI Designer produces high-fi or interactive prototype, Independent Reviewer checks exact design revisions, Master marks Design Gate, Owner authorizes Coder. PQA-specific tasks are not authorized by this example.

## Validation
The pure [design-gate evaluator](../lib/design-gate.mjs) supports offline checks for invalid dependency graphs, revisions, risk routing, missing evidence and Owner coding approval. Actual diagrams/prototypes must be created by installed tools, manually viewed/used, and independently reviewed in an authorized task. A PASS in the fixture does not prove those external tools have run.

## Two architecture scopes — scenario contrast
- **New expense APP:** SYSTEM stage -> Solution Architect defines Vue/FastAPI/PostgreSQL or alternatives with compatibility reasoning, whole-app boundary/data/runtime architecture, top-level package map and related diagrams. Only once the baseline has an applicable approval does a MODULE stage optionally design expense import/classification package internals. These are two different design packages, not two names for the same job.
- **New expense-import module in existing app:** Master routes **only Module Architect**, pins existing `system_baseline_ref`, designs importer adapter interface, expense service/repository boundaries, class/package and module sequence, testing. Do not rerun whole-app stack selection.
- **UI-only change or simple bug:** no Architect unless evidence of architectural impact. L/XL still independent DESIGN Review of actual produced artifacts.


## V0.3 prove Master coordination instead of role-labeled output
For Owner-requested orchestration acceptance, route via [auditable Dispatch Chain](../contracts/agent-dispatch.md) and [independent session runbook](master-orchestration-validation.md). A Master-produced planning markdown, apparent SYSTEM/MODULE Handoff comments and two commits **in the same assistant session** prove only role-scoped simulation. Require a specialist's own execution receipt (fresh session/task ref), actual Handoff, live Master reconciliation **before** any dependent next dispatch, with HUMAN_RELAY distinguished from actual RUNTIME_DISPATCH. Cross-session verification does not assert parallel development.
Owner applies [applicable independent Skill quality rubrics (including PA where routed)](../contracts/skill-delivery-evaluation.md) on actual professional artifacts. Master and metadata validator cannot grade design for the Owner.
