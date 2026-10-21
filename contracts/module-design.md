# Module Code Design Package — PADF V0.3

Schema: `padf.module-design/v1`. Owned by **Module Architect** for one bounded module or approved group of related components, **within** an existing approved [Solution Architecture Baseline](solution-architecture.md).

## Required identity/baseline
- `context_id`, Linear issue and immutable Feature ID(s), Task Contract, product-level High Level Spec/Catalog and applicable confirmed UI design, author, affected module path and exact `system_baseline_ref` (versioned, Owner-approved).
- Current module source revision, change scope/N/A choices, existing interfaces/consumers, upstream contract versions, applicable UI Profile/UX references.
- Document baseline conformity; any new runtime/DB/framework/major boundary proposal is **BLOCKED** pending system-level decision. Module status COMPLETED does **not** authorize that deviation.

## 产品规格与实现深度

Module Designer 接收 PA 的 High Level Specs/Catalog、批准 SA 系统方案与适用已确认 Figma，由 Master 协调 Handoff/ACK，然后产出当前阶段实施级 Feature Specs，明确具体行为、接口/数据、规则/状态、重要异常、可修改/撤销/确认/拒绝与可执行验收。产品级关键缺口回 PA/Master，不能要求 PA 先产完整实施设计，也不自行改变业务规则。详见[两阶段规格](product-definition.md)。内部方案按需包含算法、事务/并发、物理表/索引/约束、数据生命周期、迁移兼容/回滚、异常恢复与测试，关键事项不得留给实现时猜测。复用批准规格与系统基线，只补本次变化。

## Implementable module artifacts (required for material module design)
0. **Implementation-level Feature Spec** (`feature-specification`): product intent → SA/UI → executable behavior and acceptance trace. New two-phase tasks cite `product_spec_ref`, exact final `feature_spec_ref`, and actual `spec_handoff_ref`; UI consumes confirmed Figma without waiting for final frontend prototype.
1. **Module design** (`module-design`): responsibility, affected components and domain invariants, input/output data, error conditions and contracts.
2. **Module code structure** (`module-code-structure`): directory/package layout, files/classes/functions/ports, responsibility matrix, allowed dependency directions and integration seam. Contrast current and proposed structure.
3. **Module interface contract** (`module-interface-contract`): method signatures/types or API/OpenAPI portions, transactions and failure/validation semantics at accurate versions. Where no external API is changed, still specify stable internal/public module interface.
4. **Module component diagram** (`module-component-diagram`): actually rendered diagram matching the structure and dependency directions, produced with pinned diagram-design where required.
5. Test seams/matrix, security/authorization/observability, concurrency and rollback/migration analysis appropriate to the module. When database, workflow or sequence is materially changed, attach authoritative DDL/state rules + corresponding checked diagrams; may reference existing unchanged source at pinned SHA.

## Example — Expense Recording module (illustrative; not implemented)
The **Solution Architect** approved system may use Vue 3/FastAPI/PostgreSQL and frontend/back-end package boundaries. The **Module Architect** then specifies `expense_api`, `expense_service`, `merchant_classifier`, `expense_repository`, `wechat_import_adapter` and `alipay_import_adapter` with request/response types, money-decimal invariant, stable import idempotency, user-override category precedence, geolocation provenance, call sequence, code/package diagram and test cases. It must not choose a different backend/database on its own.

## Manifest/handoff
Per artifact: `kind | path@SHA | source_ref@SHA | verified | evidence_ref | render_status/generator_sha if diagram`. Master matches `module_stage.system_baseline_ref` with top-level `system_baseline_ref` and checks stale source revisions. Producer publishes existing [Agent Handoff](agent-handoff.md), Reviewer independently checks module design against the approved system baseline when required, then Owner separately authorizes Coder.
