# Module Code Design Package — PADF V0.3

Schema: `padf.module-design/v1`. Owned by **Module Architect** for one bounded module or approved group of related components, **within** an existing approved [Solution Architecture Baseline](solution-architecture.md).

## Required identity/baseline
- `context_id`, Linear issue and immutable Feature ID(s), Task Contract, approved Feature Spec, author, affected module path and exact `system_baseline_ref` (versioned, Owner-approved).
- Current module source revision, change scope/N/A choices, existing interfaces/consumers, upstream contract versions, applicable UI Profile/UX references.
- Document baseline conformity; any new runtime/DB/framework/major boundary proposal is **BLOCKED** pending system-level decision. Module status COMPLETED does **not** authorize that deviation.

## 产品规格与实现深度

正式模块设计前须有当前阶段详细 Feature Specs，明确用户行为、输入输出、规则/状态、重要异常、可修改/撤销/确认/拒绝与验收。仅 Catalog 或存在关键缺口时交 Product Analyst/Master，不在模块设计中创造产品规则。内部方案按需包含算法、事务/并发、物理表/索引/约束、数据生命周期、迁移兼容/回滚、异常恢复与测试，关键事项不得留给实现时猜测。复用批准规格与系统基线，只补本次变化。

## Implementable module artifacts (required for material module design)
1. **Module design** (`module-design`): responsibility, affected components and domain invariants, input/output data, error conditions and contracts.
2. **Module code structure** (`module-code-structure`): directory/package layout, files/classes/functions/ports, responsibility matrix, allowed dependency directions and integration seam. Contrast current and proposed structure.
3. **Module interface contract** (`module-interface-contract`): method signatures/types or API/OpenAPI portions, transactions and failure/validation semantics at accurate versions. Where no external API is changed, still specify stable internal/public module interface.
4. **Module component diagram** (`module-component-diagram`): actually rendered diagram matching the structure and dependency directions, produced with pinned diagram-design where required.
5. Test seams/matrix, security/authorization/observability, concurrency and rollback/migration analysis appropriate to the module. When database, workflow or sequence is materially changed, attach authoritative DDL/state rules + corresponding checked diagrams; may reference existing unchanged source at pinned SHA.

## Example — Expense Recording module (illustrative; not implemented)
The **Solution Architect** approved system may use Vue 3/FastAPI/PostgreSQL and frontend/back-end package boundaries. The **Module Architect** then specifies `expense_api`, `expense_service`, `merchant_classifier`, `expense_repository`, `wechat_import_adapter` and `alipay_import_adapter` with request/response types, money-decimal invariant, stable import idempotency, user-override category precedence, geolocation provenance, call sequence, code/package diagram and test cases. It must not choose a different backend/database on its own.

## Manifest/handoff
Per artifact: `kind | path@SHA | source_ref@SHA | verified | evidence_ref | render_status/generator_sha if diagram`. Master matches `module_stage.system_baseline_ref` with top-level `system_baseline_ref` and checks stale source revisions. Producer publishes existing [Agent Handoff](agent-handoff.md), Reviewer independently checks module design against the approved system baseline when required, then Owner separately authorizes Coder.
