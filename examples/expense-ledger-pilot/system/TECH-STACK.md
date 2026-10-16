# Proposed Technology Stack — SYSTEM Architect

**Proposal, not approved product stack.** Review and pin supported versions from package lockfiles at implementation time; latest-major assumptions are not approval.

| Layer | Selected candidate | Purpose / decision | Alternatives / tradeoff |
| --- | --- | --- | --- |
| Frontend | Vue 3 + TypeScript + Vite | SPA form UX, simple single-user/team distribution | React possible, but avoid both in same MVP |
| Components | Element Plus (or project-approved equivalent) | Category dropdown, upload, date picker, data grid | Bespoke controls only if design needs differ |
| State | Pinia / TanStack Query where needed | UX state + server data caching | Prefer minimal state for small MVP |
| Backend API | Python 3.x + FastAPI + Pydantic | Typed contracts, bill parsing ecosystem | Django REST if full admin/auth ecosystem needed |
| Persistence | PostgreSQL 16+ candidate + SQLAlchemy 2 / Alembic | money-safe relational transactions, dedup, migrations | SQLite insufficient for multi-user RLS/PG-specific guarantees |
| File ingestion | stdlib CSV, openpyxl for XLSX | Parse user-selected export files offline first | OCR/screen scraping NOT in MVP |
| Auth | OIDC or existing trusted auth | Server-derived user_id and user isolation | Local-only mode possible but separate threat model |
| GPS / POI | Browser Geolocation (consented, current only); optional configured geocoder | Accurate provenance; no historical GPS fiction | Manual address if no valid lookup |
| Test | pytest, isolated PostgreSQL, Playwright | Parser fixtures, DB invariants, real UI flows | No mock-only claim for Postgres |
| Runtime | Docker Compose, HTTPS reverse proxy | Low operational overhead for small APP | Managed PaaS if security/operations justify |
| Telemetry | Structured sanitized logs, health endpoint | Import trace, errors without payment details | No unsolicited analytics SDK |

### Decision rules
- Start with modular monolith, not separate microservices, broker, OCR platform or paid map dependencies.
- Money is `amount_minor: int64` with ISO currency and direction; refunds are separate direction, not negative currency floats.
- Separate provider-specific bill parsers behind an adapter protocol; **no merchant-payment API credentials**.
- Real versions must be pinned with package files and reviewed for security; `16+` is a candidate family, not a lock.
- External calls disabled by default until a data/consent policy is approved.
