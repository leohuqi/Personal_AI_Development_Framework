# Expense Ledger — proposed system baseline 0.1
schema_version: padf.solution-architecture/v1
context_id: PADF-ISSUE-5-EXPENSE-ACCEPTANCE
original_feature_id: EXPENSE-ACCEPTANCE-005
dispatch_id: I5-SYSTEM-001
architecture_scope: system
status: PROPOSED
owner_approval: PENDING
coding_authorized: false

## Scope and assumptions
One person's ledger, manual amount entry or user-exported WeChat/Alipay files, editable merchant/category suggestions, location provenance, duplicates and refunds. Synthetic fixtures only. No existing application baseline or UI Profile is approved. Prior pilot artifacts were not consumed. Proposed first platform is iPhone; this is an explicit Owner decision, not a requirement inferred from the issue. Android/web, cloud sync and bank/provider login are excluded from this proposal and require reconsideration if desired.

## Technology decision / ADR-001 — local native iPhone application
Propose Xcode 26.0, Swift 6.2 language mode, iOS 26.0 SDK, minimum iOS 17.0; SwiftUI and accessibility-native controls, Foundation/Core Data/Core Location/CryptoKit/Security from that SDK. Use a single executable and first-party APIs only; no npm/backend/container runtime, external AI API, message broker or server database. Core Data SQLite persistent store is private to the persistence adapter: its SQLite binary is OS-owned, not an independently pinned or directly queried dependency. Record OS build/store metadata in the eventual test report. App schema version starts at LedgerModel v1. Application compatibility with iOS 17 must be built/tested before coding acceptance; availability-guard any newer SDK API. No claim of installed Xcode or successful application build here.

Apple's Xcode 26 notes explicitly pair Swift 6.2 with iOS 26 SDK; Swift 6.2 release documents concurrency improvements. These establish a compatible proposed compiler/SDK family, not latest-version status or a release-ready environment:
- https://developer.apple.com/documentation/Xcode-Release-Notes/xcode-26-release-notes
- https://www.swift.org/blog/swift-6.2-released/

Build/package: Xcode workspace, Swift Package Manager local packages with swift-tools-version 6.2, no remote packages initially. XCTest/XCUITest and Instruments from Xcode 26.0. Pin exact Xcode build number and simulator images at authorized implementation start; signing/team IDs are intentionally absent. Runtime/deployment: one sandboxed iOS process, no inbound listeners or hosting. Debug simulator first; TestFlight/App Store require separate explicit release authorization and revalidation of then-current tool/submission requirements.

Why native: file picker, foreground location consent, protected storage and accessibility fit a private mobile ledger without server operations. Cost: iPhone-only, Mac build tooling, less reach. Alternatives: Flutter adds framework/plugin maintenance for cross-platform reach; browser PWA lowers distribution friction but file persistence and location support need browser-specific qualification; hosted React/API/PostgreSQL gives multi-device access but adds identity, attack surface and recurring operations. None justified by present single-user scope. If Owner needs Android/web, reopen ADR-001 before MODULE.

## System boundaries and source of truth / ADR-002
The user is the authority for category choice, import confirmation, GPS consent and backup destination. User-exported bill files cross an untrusted document boundary; they are never queried from provider accounts. There is no WeChat/Alipay API, credential capture or automatic history scraping.

| Component owner | Responsibility / owned truth | Boundary |
| --- | --- | --- |
| Ledger domain | Money/currency, entries, refunds, provenance invariants | Pure Swift values and policy |
| Application services | Entry save, import review/commit, category override, backup orchestration | Domain ports; no SwiftUI/Core Data imports |
| Import adapters | Detect explicit supported export profiles, normalize rows, retain source reference and validation report | Read-only selected files; never writes ledger |
| Category service | Versioned local merchant rules and user mappings; suggestion reason/confidence | User override outranks suggestion; no remote inference |
| Location adapter | One foreground consented sample and its timestamp/accuracy | No continuous/background tracking |
| Persistence adapter | Transactional ledger/import-source/refund-link/category-override records | Core Data owns store implementation |
| Presentation | Screens, dropdowns, import review and permission/error feedback | Calls use cases, does not mutate store directly |
| Backup adapter | Versioned portable archive, authenticated encryption, staging restore | User-selected file boundary |
| App composition | Wires adapters, permissions and lifecycle | Only layer allowed to see all implementations |

Canonical ledger lives in the local persistent store. Original provider evidence is represented by provider/profile/version, source-file hash, source row identity and import batch; user corrections do not rewrite evidence. Raw source files are transient staged inputs and deleted after review completion/cancellation; rejected-row reports contain row numbers and codes by default, not merchant/amount values. No telemetry collection. OS file provider may itself sync a user-selected export; the app does not claim control of that external destination.

## Cross-system behavior and failure contracts / ADR-003
Import pipeline: user selects file → bounded copy to protected staging → supported-profile detection → normalization/validation → local suggestion and duplicate candidates → review → explicit commit → one atomic durable transaction → staging cleanup. Cancel before commit discards staging only. Crash before durable commit leaves ledger unchanged; after commit re-opening batch ID returns committed result. Unknown header/profile/encoding stops with actionable unsupported-format report; never guesses a financial format.

Every command has a versioned result envelope: success + command/batch ID, or stable error code + recoverability + safe user message. Domain errors include INVALID_AMOUNT, UNSUPPORTED_CURRENCY, INVALID_TIMESTAMP, UNKNOWN_CATEGORY, DUPLICATE_CANDIDATE, REFUND_UNLINKED, SOURCE_CONFLICT. Adapter errors include UNSUPPORTED_EXPORT, FILE_TOO_LARGE, PERMISSION_DENIED, LOCATION_UNAVAILABLE, STORE_LOCKED, STORE_FULL, STORE_CORRUPT and BACKUP_INVALID. Technical details and raw rows never reach logs. There is no network API in v0.1; MODULE defines typed internal contracts under these conventions.

Money uses signed Int64 minor units with ISO currency; no floating-point totals. An expense is positive spend and a refund is a linked reversal record with its own provider identity; original entry remains auditable. No cross-currency aggregation/conversion. Known provider transaction ID plus provider/account namespace is strongest idempotency key; absent ID uses deterministic normalized fingerprint as a duplicate candidate, requiring review where ambiguous. Same file hash prevents accidental repeated batch commit. Different exports can overlap: file hash alone is insufficient. Refund before original is retained as unresolved, excluded from settled net calculations until linked; partial/multiple refunds cannot exceed original settled amount without explicit conflict handling. MODULE owns exact keys, transactions and state definitions.

Category suggestions are reproducible local rules with rule version and reason; explicit user choice remains stored and must not be silently replaced on reimport or rule update. Changing merchant/category rules may offer reclassification, never mutate existing entries automatically.

## Location provenance / ADR-004
Each location is one of unknown, source_provided_historical, user_entered_historical, or device_current. Source-provided text is not trusted as geocoded truth. A current fix stores collectedAt, accuracy and consent purpose, separately from transaction occurredAt; it must never be labelled the historical purchase location. Importing last month's bill never triggers GPS automatically. The user may explicitly attach a current observation with a clear time label. Manual historical location editing changes provenance to user_entered_historical. Denial, restricted permission, timeout, no fix or reduced accuracy preserves saving/import; location stays unknown or retains existing evidence. Foreground when-in-use only; no maps/geocoding SDK or background entitlement.

## Security / ADR-005
Single local OS user; no application account or backend authentication. Device passcode and app sandbox form the primary boundary; propose optional LocalAuthentication lock for viewing sensitive screens, with recovery via OS authentication. This is usability/privacy control, not an alternative encryption scheme. Apply complete file protection to store, staging, logs and export staging; defer unavailable-store work while device locked. Validate protection on Core Data auxiliary WAL/SHM files in implementation.
Untrusted CSV: streaming parser, strict length/row/file quotas, explicit encoding/profile, no formula execution. Export spreadsheet-facing text beginning with =,+,-,@ must be escaped; archive restore is data-only, allowlisted fields, no path extraction or executable content. Location is sensitive and optional. Never log amounts, merchants, coordinates, file names, raw provider IDs or keys; diagnostic events use code, duration, counts and random ephemeral correlation IDs. In-process parser is a residual crash/memory risk bounded by quotas, not represented as a sandboxed child process.

## App-wide code structure / ADR-006
```text
ExpenseLedger/
  App/                         # SwiftUI entry, composition, permissions, lifecycle
  Packages/
    LedgerDomain/              # Money, ledger/provenance policies; Foundation only
    LedgerApplication/         # use cases and ports; depends on Domain
    LedgerPersistence/         # Core Data adapter/model/migrations
    BillImport/                # provider export adapters/profile registry
    CategoryRules/             # deterministic local rules and user mappings
    LocationAccess/            # Core Location adapter
    BackupArchive/             # portable schema/encryption/file adapter
    LedgerPresentation/        # feature screens and view state
    DesignSystem/              # tokens/components after approved UI Profile
  Tests/                       # contract, persistence, synthetic import, UI suites
  Fixtures/Synthetic/          # fake provider-shaped examples, never real bills
  Docs/ADRs/                   # decisions + model/backup version notes
```
Dependency direction: Presentation → Application → Domain. All adapters → Application ports + Domain. App → Presentation + adapters. Presentation → DesignSystem. Domain knows no UI, storage or permission framework; adapters never depend on Presentation or one another. Shared code is limited to domain primitives and result conventions; no generic Common package. Cross-adapter coordination belongs in use cases. New provider is a profile/adapter behind the import port, not changes to UI or domain. Architectural dependency check rejects cycles and forbidden imports during implementation. This is a package topology, not MODULE file/class design.

## NFRs, resilience and acceptance budgets
Targets, not measured results: 100,000 ledger records; 10,000-row / 10 MiB maximum import; 256 KiB maximum row, bounded fields. On an iPhone 13/iOS 17 test device: entry save p95 <200 ms, first ledger page <500 ms from ready store, import preview <5 s for 10,000 rows, no UI stall >100 ms, peak additional import memory <100 MiB. Streaming parsing runs off main actor; Core Data writes serialize through adapter, main actor owns UI state. Long import cancel check at least every 100 rows. No monetary loss on interruption: committed data durable or whole import rolls back. Disk-full retry must not create duplicates. Baseline device/OS and percentile sample protocol belong in actual test evidence. Accessibility: Dynamic Type, VoiceOver labels, full keyboard traversal where supported, minimum contrast target 4.5:1; exact visual decisions belong to UI role.

Observability is local opt-in diagnostics with redacted error codes and timing/count histograms; clear-on-demand and 7-day cap. No automatic upload. Restore data integrity checks are mandatory regardless of diagnostic opt-in. Availability is local/offline except OS permission/file provider interactions; no cloud uptime SLA.

## Backup, migration and rollback / ADR-007
Portable backup envelope v1 contains schema version, export time, currency metadata, immutable entries/source/refund/category/provenance records, counts and checksum; no raw imported documents. Propose user-passphrase-derived key using PBKDF2-HMAC-SHA256 (CommonCrypto from SDK), random 16-byte salt, 600,000 iterations, AES-256-GCM (CryptoKit), unique 12-byte nonce, authenticated header. Archive parser limits and KDF version recorded. Benchmark KDF on baseline device; tune only via explicit new envelope version. Password is never persisted. Forgetting it means archive cannot be recovered. Backup opt-in; user may save to OS file provider; warn that chosen destination can sync externally. Exclude app store/staging from automatic OS cloud backup if manual encrypted backup is the selected policy. Owner must confirm recovery tradeoff before implementation.

Restore decrypts/verifies to protected staging, validates schema/refunds/counts, then creates a separate candidate persistent store. Swap only after validation while writes paused; retain encrypted prior snapshot until user verifies restore. Incorrect password, corruption or unsupported schema leaves current ledger untouched. No merging multiple archives in v1.
Before schema migration create verified protected backup; lightweight Core Data migration only when compatible and tested, explicit mapping otherwise. Never downgrade in place. Rollback restores compatible pre-migration store plus prior binary, with clear warning that post-upgrade changes are absent; forward repair is preferred. Migration failure opens recovery mode read-only, not a fresh empty ledger. Initial rollout has no legacy data; future schema v2 requires fixtures and restore/downgrade rehearsal. Core Data store is not the portable backup format.

## Owner decisions and downstream boundary
D1 Accept iPhone-first local/offline scope and version family, or require cross-platform/cloud reassessment.
D2 Accept manual encrypted backup/recovery tradeoff and no automatic cloud backup, or revise.
D3 Accept deterministic local categorization and conservative duplicate/refund handling.
D4 Select diagram style: explicit default or supplied profile/tokens. Required diagram production is blocked by this gate.
D5 Approve exact immutable system source SHA after required visual gap is resolved or explicitly decide how to handle the incomplete proposal. No implicit approval by receipt/PR.

MODULE should detail import/category/location/ledger transaction/backup interfaces and schema within an approved baseline. UI Profile is absent; UI author must resolve it. Independent DESIGN review for L is pending. Owner scoring SA-Q1–5 is pending. No MODULE, UI, application code, merge, deployment or production access is authorized by this document.
