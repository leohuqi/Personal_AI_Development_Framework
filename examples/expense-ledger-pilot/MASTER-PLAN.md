# Master Orchestrator — Expense Ledger pilot / Stage Plan

- Status: **PILOT / DOCUMENTATION ONLY**; no product feature or owner-approved tech stack.
- GitHub issue: https://github.com/leohuqi/Personal_AI_Development_Framework/issues/4
- PADF Draft PR: https://github.com/leohuqi/Personal_AI_Development_Framework/pull/3
- `context_id: PADF-EXPENSE-ARCH-PILOT-001` · `original_feature_id: EXPENSE-RECORD-001` (test-only)
- `task_class: L`; `architecture_scope: both` (new APP solution plus one detailed module).
- **Master controls routing & dependency:** solution-architect -> Master checkpoint -> module-architect -> Master reconciliation; no parallel development, automatic invocation, merged/production code, or approval by messages alone.

## Requirements and acceptance
1. Record amount, merchant, transaction date, currency and category; user may correct suggested category via a dropdown and optionally save personal merchant preference.
2. Accept **user-exported personal WeChat/Alipay CSV/XLSX** or manual entry; no unofficial consumer payment-history API assumption, credentials, screen scraping or real account connection.
3. Location from source address/branch match, authenticated contemporary GPS with consent, or manual input; provenance and confidence required, current GPS cannot backfill historical transactions.
4. Server validates idempotency, per-user isolation, transactions/refunds and errors; all demonstrations use synthetic data only.

## Stage graph
| ID | Role | Required input | Required output | Current authority |
| --- | --- | --- | --- | --- |
| SYSTEM | solution-architect | This scope, project boundaries | System architecture baseline PROPOSED, technology stack, application code skeleton, diagrams | **Draft only**; owner approval PENDING |
| MASTER-CHECK | master-orchestrator | SYSTEM actual artifacts | Checkpoint: conflicts, system SHA, baseline approval state | Read-only; may request conditional module draft |
| MODULE | module-architect | System artifact SHA + module feature scope | Detailed package/interfaces/workflow/tests and component/sequence visuals | **Conditional draft**, not a formally approved dependent stage |
| RECONCILE | master-orchestrator | Both immutable refs/handoffs | Cross-design consistency, status and blockers | No DESIGN_READY until required Owner baseline & Independent DESIGN Review |

## Dependency and governance
SYSTEM must be approved by Owner before Module Architect may assert `COMPLETED` against a binding baseline; this single-chat design exercise uses a **clearly conditional module draft** to inspect design quality before approval. Its `system_baseline_status=PROPOSED` and Master Gate are BLOCKED pending real approval. No impersonation of real separate Agent runtimes: these are **role-scoped sequential authoring passes under one coordinator**, not independently authenticated sessions.

Acceptance evidence is paths/SHAs and explicit decisions, not a story that two live agents automatically dispatched. L requires fresh-context independent DESIGN review for a production workflow, which has **NOT RUN**.
