# Module Architect Deliverable — Expense Entry & Personal Bill Import

**Status: CONDITIONAL DRAFT ONLY** · Module Architect stage follows Master checkpoint [Issue #4](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/4#issuecomment-6208617242).  
Context: `PADF-EXPENSE-ARCH-PILOT-001` · Feature: `EXPENSE-RECORD-001` (test-only).  
**Mandatory upstream system baseline:** `examples/expense-ledger-pilot/system/SOLUTION-ARCHITECTURE.md@5a907d75973296239e5e5c81d91548f3f945897d` (**PROPOSED**, Owner approval pending). Formal MODULE `COMPLETED` and Design Gate `DESIGN_READY` are **BLOCKED**.

## 1. Module and interface boundaries
This document designs **implementation structure within** the Solution Architect's Vue 3/FastAPI/PostgreSQL modular monolith. It does not decide a new language/ORM/database, change global identity architecture, or authorize production.
- **Inbound HTTP**: upload user-exported personal CSV/XLSX to preview; manual or imported draft confirmation; category override; optional merchant preference; listing/search.
- **Application ports**: `BillParser`, `ExpenseRepository`, `MerchantResolver`, `CategorySuggester`, `LocationResolver`; use dependency injection adapters.
- **Domain invariants**: integer minor-unit amount, ISO currency code, explicit direction, server-derived owner, exactly-once *logical* saved record under retry, preserve original merchant/source/provenance, no autofill that overwrites user edits.
- **Persistent data**: `transactions`, `import_batches`, `merchants`, `categories`, `merchant_category_rules` (proposed, requires audited tenant-safe DDL and real PostgreSQL tests).

## 2. Business logic (implementable decisions)
### 2.1 Import
1. `ImportController.preview(file, source)`: authenticated owner, accept only explicit, size-limited and structurally validated CSV/XLSX; no payment account secret or merchant API.
2. `SourceDetector` checks allowed source signatures/headers and encoding; uncertain formats -> `UNSUPPORTED_BILL_FORMAT`, not a guess.
3. `WechatBillParser` / `AlipayBillParser`: parse header/layout/source transaction ID, time/timezone, amount and debit/refund/transfer direction; provider-specific files must be versioned fixtures, not assumed universal columns.
4. `Normalizer` -> `ExpenseDraft` typed cents/direction/currency; preserve raw row provenance without persisting unrestricted payment notes.
5. `ImportPreviewService`: batch-level idempotency and per-row issue list; malformed row surfaced, no silent skip. Import transaction not committed until explicit confirmation.
6. User edits category/location, then `ExpenseConfirmService` revalidates ownership/amount and commits idempotently in one DB transaction.

### 2.2 Category suggestion
Precedence: **explicit category chosen by user > user-specific merchant rule > exact merchant/category catalogue mapping > keyword heuristic > uncategorized**.
- Suggestion returns `category_id`, source/rule ID, reason/confidence, not silently final.
- The user's dropdown can always override suggested category.
- `remember_merchant=true` persists a tenant-scoped merchant-category rule in the confirmation transaction, never alters another user's mappings.

### 2.3 Location and provenance
- For import, use source-provided unambiguous location where available; optionally use uniquely identified merchant branch POI; otherwise UNKNOWN/user manual edit. **Never apply current device GPS to an old imported transaction.**
- For contemporaneous manual record, request Browser Geolocation only with explicit user consent and record timestamp/accuracy; do not accept arbitrary GPS as verified history.
- Every location stores `location_source`, `location_confidence`, optional lat/lon/address and user override. Conflicts must remain reviewable.

### 2.4 Idempotency and tenant isolation
- Prefer `(user_id, provider, source_external_id)` unique ID where provider supplies stable ID.
- Fallback fingerprints must include meaningful date/time, amount, direction, merchant and immutable source batch/row evidence; **collision/ambiguity -> review, not automatic data loss**.
- All repository lookup/write applies authorized `user_id` server-side. Proposed composite tenant FKs and SQL migration are **NOT approved or tested**.
- Prevent repeat `Confirm` clicks/double imports from creating duplicate expenses, but do not collapse legitimately repeated transactions with identical amount/merchant/time accidentally.

## 3. Error / edge cases
`INVALID_AMOUNT`, `UNSUPPORTED_BILL_FORMAT`, `AMBIGUOUS_MERCHANT`, `CATEGORY_NOT_OWNED`, `IMPORT_DUPLICATE`, `IMPORT_ROW_CONFLICT`, `LOCATION_UNVERIFIED`, `UNAUTHORIZED`, `TENANT_CROSS_REFERENCE`, `STORAGE_FAILURE`.
- Convert provider values with Decimal/string-safe monetary parsing; never binary floating point.
- Source date fields are interpreted only with a configured timezone, preserving original representation/timezone information where possible.
- Preview is read/parse oriented; confirm revalidates permission and source integrity.
- No irreversible deletion of the originally approved raw export without an explicit retention policy.

## 4. Artifacts and design provenance
- [MODULE-CODE-STRUCTURE.md](MODULE-CODE-STRUCTURE.md) — concrete Python packages/classes, responsibilities and dependencies.
- [INTERFACES.md](INTERFACES.md) — type contracts, service API and error semantics.
- [expense-api.yaml](expense-api.yaml) — illustrative OpenAPI contract, NOT running endpoints.
- [module-components.svg](module-components.svg) — module/component view, human-authored SVG.
- [module-sequence.svg](module-sequence.svg) — import preview → confirm sequence, human-authored SVG.
- [MODULE-TEST-PLAN.md](MODULE-TEST-PLAN.md) — acceptance, tenant/idempotency and failure coverage.
- System package fixed at `examples/expense-ledger-pilot/system/SOLUTION-ARCHITECTURE.md@5a907d75973296239e5e5c81d91548f3f945897d`; any incompatible system baseline change -> STALE module design pending reassessment.

## 5. Approval and execution boundary
Module-level design output is a **draft based on a proposed system**, not a valid completed dependency under strict PADF V0.3 Gate. No new coding task, real payment data import, API integration or database migration is authorized. Independent DESIGN review is **NOT RUN**, Owner system baseline approval **PENDING**, diagram-design external Skill runtime invocation **NOT RUN**.
