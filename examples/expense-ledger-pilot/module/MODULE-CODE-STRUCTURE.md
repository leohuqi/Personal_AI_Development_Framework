# Expense Module — High-Level Code Architecture / Package Design

**Module Architect** · System baseline: `examples/expense-ledger-pilot/system/SOLUTION-ARCHITECTURE.md@5a907d75973296239e5e5c81d91548f3f945897d` (PROPOSED; conditional only).

```text
backend/app/
  api/v1/
    imports.py                       # POST preview; authenticated owner only
    expenses.py                      # POST confirm; list/lookup; typed HTTP errors
  application/
    import_preview_service.py        # source adapter dispatch, row errors, draft token
    expense_confirm_service.py       # validate + transaction + idempotency
    ports.py                         # BillParser, ExpenseRepository, RuleRepo protocols
  domain/expense/
    entities.py                      # ExpenseDraft, ConfirmedExpense, Provenance
    money.py                         # minor-units, ISO currency + direction
    merchant_resolution.py           # exact/alias branch lookup, ambiguity
    category_policy.py               # user override > rule > merchant > keyword
    location_policy.py               # bill/POI/GPS/manual, confidence/provenance
    fingerprints.py                   # ambiguity-aware idempotency key
  adapters/importers/
    common.py                        # normalize provider columns; no PII logging
    wechat_csv.py                     # versioned user-export CSV adapter
    alipay_csv_xlsx.py                # versioned personal export CSV/XLSX adapter
  infrastructure/db/
    models.py                         # SQLAlchemy 2, tenant scoped
    expense_repo.py                   # transactions, dedup and user-scoped CRUD
    import_batch_repo.py              # file hash/import batch audit
    category_rule_repo.py             # user merchant category preferences
    session.py                        # DB transaction boundary (injected)
  platform/
    auth_context.py                   # server-side identity principal
    config.py                         # size/time limits and opt-in POI
frontend/src/
  features/expense-entry/             # ExpenseForm, CategoryDropdown, PlaceInput
  features/bill-import/               # FilePicker, PreviewTable, ErrorSummary
  shared/api/                          # generated OpenAPI-typed client
tests/
  unit/                                # bill adapters, policies, idempotency keys
  integration/                         # real PG tenant FKs, batch/confirm retry
  e2e/                                 # file preview → manual category override → save
```

## Component ownership and call chain
- `imports.py` -> `ImportPreviewService` -> `BillParser` (port) -> WeChat/Alipay adapters -> `ExpenseDraft`.
- `expenses.py` -> `ExpenseConfirmService` -> `CategoryPolicy` / `LocationPolicy` -> `ExpenseRepository` transaction.
- `ExpenseConfirmService` depends on `Repository Protocol`, **not SQLAlchemy models**; persistence implements port in infrastructure.
- `CategoryPolicy` never makes network calls. Only optional `LocationResolver` adapter may access POI with separate consent and privacy policy.
- Frontend does not choose authoritative `user_id`; server identity context provides it.

## Implementation seams
- Contract tests for provider adapters use **synthetic** header/layout fixtures.
- Pure domain unit tests for category precedence, amount scaling, location provenance.
- Real isolated PostgreSQL for ownership/FK/unique/transaction/idempotency invariants.
- Browser end-to-end for dropdown override, GPS permission denial, duplicated upload preview, row errors and retry.

No production classes/files have been created by this architecture document; naming is a code-design proposal.
