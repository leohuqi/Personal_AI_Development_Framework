# Concrete proposed code and test map
Current: no application code; framework contracts and synthetic design evidence only. Target is the approved SYSTEM packages, no new top-level runtime package.

| Package / file | Concrete type and responsibility | Allowed imports |
|---|---|---|
| LedgerDomain/Money.swift | Money, CurrencyRegistry, checked parsing/totals | Foundation |
| LedgerDomain/ExpenseRecord.swift | ExpenseRecord, EntryKind, immutable SourceSnapshot values | Foundation |
| LedgerDomain/IdentityPolicy.swift | canonical component encoding, identity material and candidate policy | Foundation; crypto executed through port |
| LedgerDomain/RefundPolicy.swift | RefundPlan validation, signs/currency/cap | Foundation |
| LedgerDomain/LocationEvidence.swift | provenance cases and sample acceptance policy | Foundation |
| LedgerApplication/ExpenseCommands.swift | command/query DTOs, envelope v1 | Domain |
| LedgerApplication/ExpenseUseCases.swift | actor ExpenseUseCases save/override/link | Domain |
| LedgerApplication/ImportCoordinator.swift | actor ImportCoordinator transient handles and review revisions | Domain |
| LedgerApplication/Ports.swift | LedgerStorePort, ImportPort, CategoryPort, LocationPort, IdentityPort, MaintenancePort | Domain |
| LedgerPersistence/CoreDataLedgerStore.swift | actor serial writer, DTO mapping/receipts | Application, Domain, CoreData |
| LedgerPersistence/LedgerModel.xcdatamodeld | LedgerModel v1 model described in CORE-DATA-MODEL.json | CoreData model resource |
| LedgerPersistence/StoreRecovery.swift | protection checks, maintenance lease, candidate validation/swap | Application, Domain, CoreData |
| LedgerPersistence/IdentityVault.swift | protected identity key + HMAC implementation for IdentityPort | Application, Domain, CryptoKit, Security |
| BillImport/ProfileRegistry.swift | exact synthetic marker/header profile matching | Application, Domain, Foundation |
| BillImport/StreamingCSV.swift | bounded RFC4180 reader; never formula execute | Application, Domain, Foundation |
| BillImport/SyntheticBillAdapter.swift | normalize approved synthetic v1 rows | Application, Domain, Foundation |
| CategoryRules/LocalCategoryRules.swift | user mapping then pinned local deterministic rules | Application, Domain |
| LocationAccess/CurrentLocationSampler.swift | @MainActor CoreLocation delegate bridge, explicit consent token | Application, Domain, CoreLocation |
| BackupArchive/ArchiveSnapshotAdapter.swift | approved encrypted envelope v1; immutable snapshot/candidate ports | Application, Domain, CryptoKit, CommonCrypto |
| LedgerPresentation/ExpenseFormModel.swift | @MainActor form state; no direct persistence | Application, Domain, SwiftUI |
| LedgerPresentation/ImportReviewModel.swift | @MainActor review/commit/retry/error state | Application, Domain, SwiftUI |
| App/ExpenseComposition.swift | inject concrete adapters/permissions; only composition sees all | Presentation + adapters |

Application -> Domain. Adapters -> Application ports + Domain. Presentation -> Application (+ approved DesignSystem later); no adapter-to-adapter or presentation-to-CoreData edge. IdentityVault is persistence-private implementation of application IdentityPort, does not become a shared adapter dependency. Use case obtains identity material/snapshot through ports and passes values to parser/rules. Existing topology unchanged.

Tests/Domain: MoneyTests, IdentityCanonicalizationTests, DuplicatePlanTests, RefundPolicyTests, LocationPolicyTests. Tests/Application: ImportCoordinatorTests with deterministic clock/UUID/fake ports; mutation and retry tests. Tests/Persistence: actual temporary SQLite Core Data store, fault injection before/after save, constraints and maintenance recovery. Fixtures/Synthetic only; Tests/UI later XCUITest maps UI-facing seams. No implementation has been written in this pilot.
