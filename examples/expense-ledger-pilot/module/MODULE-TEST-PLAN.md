# Module Architect — Testing and acceptance plan (not executed)

**Status: PROPOSED test cases / NOT RUN**. Existing previous pilot's mock browser tests do **not** establish current module/API or database implementation readiness.

| ID | Test scenario | Expected outcome | Layer / Status |
| --- | --- | --- | --- |
| E-01 | WeChat personal export fixture parsed | Accurate cents, provider txn ID, time, merchant, source | Unit / NOT RUN |
| E-02 | Alipay personal export fixture parsed | Accurate normalized record with source direction | Unit / NOT RUN |
| E-03 | Unsupported/bad encoding CSV | Row errors, no guessed spending | Unit/API / NOT RUN |
| E-04 | Two legitimate same-amount merchant transactions | Do not merge distinct source IDs | Unit/DB / NOT RUN |
| E-05 | Reimport same file & confirm twice | Idempotent response, exactly one saved expense | Isolated PG / NOT RUN |
| E-06 | Category suggestion and manual dropdown override | User choice wins, category belongs to user | Unit/API/E2E / NOT RUN |
| E-07 | Remember merchant preference | Future suggestion uses tenant-specific rule | Isolated PG / NOT RUN |
| E-08 | Import of old transaction and GPS now | Never historical GPS backfill | Unit/E2E / NOT RUN |
| E-09 | Denied geolocation/ambiguous merchant | UNKNOWN/manual fallback; provenance preserved | Unit/E2E / NOT RUN |
| E-10 | Cross-user merchant/category IDs | Consistent 403/422 and DB constraints; no leakage | Isolated PG / NOT RUN |
| E-11 | Refund/income/transfer CSV | Direction preserved; not summed as ordinary expenses | Unit/DB / NOT RUN |
| E-12 | Malicious/big file | Size/format/zip-bomb limits and redacted logging | Security/API / NOT RUN |

## Implementation risks to resolve in DESIGN Review
- OIDC choice and tenant integrity schema (composite foreign keys and RLS).
- Preview token storage/expiry and row integrity; handling partial batch import.
- Personal WeChat/Alipay export dialects and source ID availability require actual **non-sensitive** fixture validation.
- Idempotent fallback fingerprint collision semantics; do not treat a hash as a guaranteed unique business transaction.
- Geocoder consent, sensitive location retention and category semantics.
