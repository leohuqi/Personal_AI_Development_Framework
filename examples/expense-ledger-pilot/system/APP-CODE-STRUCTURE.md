# High-Level APP Code Structure — SYSTEM Architect

This is an **application/module skeleton**, not detailed class/method design. Each module's internal shape is assigned to Module Architect.

```text
expense-ledger/                       # candidate modular-monolith repository
├── frontend/
│   ├── src/app/                      # router + app composition
│   ├── src/features/expenses/        # expense entry/history UI
│   ├── src/features/imports/         # user bill-import review UI
│   ├── src/shared/ui/                # project design-system components
│   └── src/shared/api/               # generated/typed API client
├── backend/
│   ├── app/api/                      # FastAPI routes + auth context
│   ├── app/domain/                   # pure domain and policies
│   ├── app/application/              # use cases and ports
│   ├── app/adapters/                 # provider file parsers, POI integration
│   ├── app/infrastructure/db/        # repositories, models, session
│   └── app/platform/                 # config, logging and errors
├── migrations/                       # Alembic, versioned + rollback assessment
├── tests/unit/                        # domain, parser and classification
├── tests/integration/                 # real PG DB + API
├── tests/e2e/                         # browser UX
├── contracts/openapi.yaml             # canonical typed API
└── deploy/compose.yaml               # prototype-only deployment
```

### Architecture rules
- No `FastAPI` imports inside pure domain; no SQLAlchemy model coupling in domain entities. API is thin.
- External bill formats do not leak beyond adapters into core domain.
- Idempotency + data ownership require a DB-backed consistent transaction boundary.
- Module Architect defines actual files/classes/interfaces for `bill-import` and `expense-domain`; these paths are **candidate packages** and are not code already created.
- UI design system is **project-specific**, not PADF's visual vocabulary.
- If a future module needs another queue/database/provider, propose it to Solution Architect + Owner, not by module-level silent architecture change.
