# Solution Architect Deliverable — Expense Ledger APP (SYSTEM)

**Status: PROPOSED, not Owner-approved** · Context: PADF-EXPENSE-ARCH-PILOT-001  
Scope: entire new consumer expense-recording APP, not individual parser implementation. System baseline candidate is this Git commit/manifest once persisted, not an approved production source.

## 1. System boundaries and technical architecture
- **Client:** responsive Vue 3/TypeScript SPA. A local file picker uploads user-selected personal CSV/XLSX export; manual-entry forms and category dropdown. Browser geolocation only after explicit user action.
- **API:** FastAPI typed REST boundary, identity from authenticated server context, validation and rate/file-size limits, never accept a client-provided user_id as authority.
- **Application services:** modular monolith with expense domain, import normalization adapters, merchant/category suggestion, geolocation provenance and persistence.
- **Data:** PostgreSQL relational store, migration via Alembic; uploaded raw files processed as temporary content with retention/deletion policy, not permanent payment credential storage.
- **External integration:** optional user-approved geocoder/POI lookup is a separate privacy-controlled adapter; **no direct WeChat/Alipay personal history API is assumed**.
- **Deployment candidate:** Docker Compose with HTTPS reverse proxy for small personal deployment; alternatives documented in TECH-STACK.md.

## 2. Data flow and trust
1. The user selects a historical export file or supplies a manual expense; incoming data remains **untrusted**.
2. API authenticates, size/type limits, parses with restricted adapters and normalizes into `NormalizedTransaction` (source, stable source ID/fingerprint, amount_minor, direction, merchant_raw, occurred_at, currency).
3. Domain services suggest merchant category based on precedence **user rule > merchant catalogue > keyword > uncategorized**. Never overwrite deliberate user selection.
4. Location is evidence tagged: bill address (if actual and verifiable), branch-specific POI if uniquely resolved, contemporaneous GPS if authorized, user entry, or UNKNOWN. No GPS inference for historical imports.
5. UI reviews and explicitly confirms the record. Repository transaction enforces deduplication and ownership.
6. Database stores source/provenance and user-specific rules; raw files discarded or retained only under an explicit secure retention policy.

## 3. Main application modules (top-level, not module implementation)
- `web-ui`: reusable product components and expense, history and import views.
- `api`: HTTP boundary, auth context, input validation, contract documentation.
- `expense-domain`: expense lifecycle, categorization, merchant and location policy.
- `bill-import`: source adapters, validation, normalization, import-batch staging and partial-failure reporting.
- `storage`: SQLAlchemy models, repositories and Alembic migrations.
- `platform`: environment, logging/metrics, configuration, security and deployment.

**Dependency policy:** UI → public API; API → application/domain port; domain does not import FastAPI/SQLAlchemy implementation; infrastructure/adapters implement defined ports; per-user access enforced at data access and transaction scopes. Avoid a new service/microservice per adapter.

## 4. Structured sources and visuals
- [TECH-STACK.md](TECH-STACK.md) — concrete proposed stack, version policy, alternatives, test/build/deploy choices.
- [APP-CODE-STRUCTURE.md](APP-CODE-STRUCTURE.md) — entire-APP package/module skeleton, boundaries and layering rules.
- [ADR-001-modular-monolith.md](ADR-001-modular-monolith.md) — architecture decision proposal, not approved.
- [technical-architecture.svg](technical-architecture.svg) and [app-code-architecture.svg](app-code-architecture.svg) — **human-authored illustrative SVGs**, not external diagram-design runtime results.
- Previous [source pilot schema SQL](../../../../../examples) is **not** imported into this repository; new module design must explicitly state DB invariants and production migrations remain unapproved.

## 5. NFR and operational constraints
- Money: integer minor units, currency code and direction; no floating-point CNY totals; refunds/transfers not ordinary expenses.
- Data privacy: per-user isolation, no payments credentials, sensitive bill upload lifecycle audit; HTTPS and least privilege.
- Reliability: import dedup, partial failure/retry with idempotent DB transaction, no silent auto-categorization override.
- Quality: strict import contract fixtures, contract tests, isolated real PostgreSQL integration when coding is authorized, browser UI state tests.
- Rollout: local/sandbox prototype first; production auth/RLS/composite ownership constraints, secure upload scanner/storage and backups are unresolved decisions.
- Observability: typed errors, request/import correlation IDs, sanitized logs; no raw transaction descriptions in telemetry.

## 6. Open decisions / Owner approval
Exact hosting/auth provider, retention, file size and bill formats, category taxonomy, currency policy, GPS opt-in UI, physical schema tenant integrity, disaster recovery and tech-stack versions must be reviewed before binding approval. This deliverable does **not** authorize any coding or data import.
