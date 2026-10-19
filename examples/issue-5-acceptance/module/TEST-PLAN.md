# Verification scope and required implementation tests
Executed in this design delivery: reproducible metadata/model/diagram consistency checks, synthetic identity/money/refund reference examples, actual browser renders and visual inspection. No Swift or Core Data executable implemented; application/device/integration/performance tests below are NOT_RUN and mandatory before coding acceptance.

| ID | Layer / case | Required assertion |
|---|---|---|
| U01 | exact money CNY/JPY, .01, excessive decimals, Int64 bounds, totals overflow | no Float, checked parse/sum, no write on invalid |
| U02 | canonical length encoding, Unicode NFC/case, punctuation, IDs case, absent IDs | stable vectors; delimiter collisions impossible; no false unique fingerprint |
| U03 | A[X,Y], B[Y,Z], same-file replay, wrong namespace | one new Z; explicit duplicate Y; old receipt; wrong namespace conflict |
| U04 | same ID changed amount/currency/status, same ID twice within batch | block conflicting row; no property-trump; duplicate observation audit preserved |
| U05 | no-ID identical purchases, multiple candidates, override then reimport | explicit decisions; separate possible; original override unchanged |
| U06 | full/partial/multiple refunds, duplicate refund, before original | cap checks order-independent; unresolved excluded; later explicit linking |
| U07 | original refund/self/cross-currency/over-cap reference | no link or net corruption; retained evidence |
| U08 | category mapping/rule tie/version update/retirement | user override wins; no automatic reclassification |
| I01 | disk SQLite all-or-none before/after save crash, full disk, locked store | entries+identities+links+receipts atomic; retry returns one result |
| I02 | concurrent manual edits and commit; stale preview/category; epoch swap | serial writer, revision/epoch mismatch aborts all |
| I03 | cancel parse/review/pre-save/during-save/post-save, cleanup fail | no pre-save writes; during save outcome checked; committed success preserved |
| I04 | same command different payload, same request twice, unknown receipt | SOURCE_CONFLICT or receipt replay; checking state never false retry |
| S01 | CSV formulas, path traversal, symlink, malformed quotes, invalid UTF8, BOM/GBK/UTF16, headers | inert text, random staging paths, unsupported reject, no logs of raw values |
| S02 | 10MiB/10k/256KiB/field limits +/-1, long quotes/newlines, cancel interval | bound before allocation, no truncation, responsive cancellation |
| L01 | GPS denied/restricted/no fix/timeout/reduced/stale fix, expired/reused consent | manual/import usable; existing evidence retained; current timestamp label; no background request |
| R01 | encrypted backup wrong password/corrupt/schema/counts/key/ref/duplicate/cap | current store unchanged; data-only allowlist; limits; no raw files |
| R02 | v1->v2 compatible/incompatible migration failure/crash/swap rollback | protected verified prebackup; read-only recovery; no empty ledger; epoch invalidates preview |
| UI01 | review includes invalid/source conflict/duplicates/unresolved, stale/locked/full/retry | typed states and enable guards; user choices preserved; safe codes |
| UI02 | current GPS vs transaction historical text, override dropdown | truthful time/provenance and suggestions; VoiceOver/Dynamic Type by UI role |
| P01 | approved iPhone13/iOS17, 100k records/10k rows and memory | measure baseline budgets, no claim from this design |

Fixtures must be synthetic. Use deterministic clock, UUID generator, consent fake and store fault injector; Core Data tests use actual disk SQLite not only in-memory. Separate true process-kill durability from exception rollback. Crash harness checkpoints before save/after save/before reply. OS file-protection/WAL/SHM/cloud-backup exclusion and iOS17 availability tests require authorized device build. Run independent DESIGN review against exact immutable sources; author assertions are not independent acceptance.
