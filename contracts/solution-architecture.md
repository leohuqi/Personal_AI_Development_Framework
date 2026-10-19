# Solution Architecture Baseline — PADF V0.3

Schema: `padf.solution-architecture/v1`. Owned by **Solution Architect** for a whole product/application or cross-system architecture revision. It is distinct from the module code design.

## Mandatory deliverables for a new application / material platform change
- `context_id`, immutable Feature ID(s), status PROPOSED/COMPLETED/APPROVED, Owner approval and versioned baseline ref.
- **Architecture context and boundaries**: user/externals, system decomposition, bounded contexts, module ownership, communication and data-flow boundaries.
- **Technology Stack Decision** (`technology-stack`): frontend/backend languages/frameworks, component/UI conventions, database/storage, integration/auth, build/test tools, runtime/hosting/deployment, versions and compatibility; accepted/rejected options, decision rationale and ADRs.
- **Application Code Structure** (`application-code-structure`): top-level repositories/services/packages and module boundaries, dependency rules, shared libraries, layering, API direction, extension strategy and coding/architecture policies. This is the *application skeleton*, **not** classes/functions/algorithm for each feature module.
- **Solution Architecture** (`solution-architecture`): logical + technical system model, system NFR/security, deployment/observability, failure boundaries, data ownership and high-level API contract conventions.
- Professional `architecture-diagram` showing system/technology boundaries and applicable deployment/integration/data diagrams tied to technical sources using pinned diagram-design and verified rendering.
- Impact/transition plan: existing-app baseline diffs, compatibility, migration, rollback and decisions for Owner; evidence/status refs.

## Handoff and scope
- Producer: Solution Architect -> Master, and to Module Architect/UI Designer as applicable, through V0.2 Agent Handoff.
- Module Architect **consumes** this approved immutable baseline; it may propose changes but cannot replace technology decisions. Baseline change invalidates impacted module design and corresponding DESIGN review until revalidated.
- On existing products, reference the **approved unchanged baseline** with pinned SHA instead of redesigning whole system for every Feature. When no valid baseline exists, Master routes Solution Architect (or Owner first approves establishment of a baseline).
- Small non-architectural bugs need neither new Solution nor Module design by default.
- [Architecture diagram](../integrations/diagram-design.md) supplements, does not supersede, precise source code/contracts.
