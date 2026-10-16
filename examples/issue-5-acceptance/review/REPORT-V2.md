# Independent DESIGN re-review — round 2
schema_version: padf.independent-design-review/v1
context_id: PADF-ISSUE-5-EXPENSE-ACCEPTANCE
original_feature_id: EXPENSE-ACCEPTANCE-005
dispatch_id: I5-REVIEW-003
execution_id: I5-REVIEW-EXEC-003 (local audit label, not runtime UUID)
reviewer: independent-reviewer /root/design_reviewer
execution_mode: RUNTIME_DISPATCH
context: continuation of original independent reviewer; not a new fresh session
mode: DESIGN
verdict: REQUEST CHANGES
coding_authorized: false

## Exact scope
PR6 base f1b6a6e4a90d547127bd95bceaa12880a7c39855.
Own first round-2 clock: 2026-10-16 09:37:00 UTC.
Live PR head observed at review start: 823c4c776c69251fe86d3c18aba7c49d19681206.
Reviewed affected UI diff: 367bdd2dfc46a868290750f8088da9cdb53575a9 → bd96d6c5b4ac4fa241e92f609f08be42f0ccb53b.
Corrected producer Handoff independently read at cff82cc0e1ef8f1e1dff1a6c1473a3c17f9d12bf; actual launch_ref correction bf98fba23ae2e61c2331eda6824afcc07fe7fbf1 is preserved.
Reviewed exact original requirements, pinned own Reviewer Skill ec5d9f21b52a2273e8b899f436e19b0243c27e0d and unchanged MODULE design/API/model/profiles ad5a536bf2f6636d53ba51452cc555d54b82456b.

All 18 existing local textual source/evidence files copied into isolated r2-source matched exact remote Git blobs. Independently verified corrected manifest's 21 actual file hashes, including five expressly LOCAL_ONLY PNGs. Exact remote trees show Profile/tokens unchanged from d7e9c679a0a435310ef76d63432917d7e1656078; SYSTEM/MODULE blobs unchanged. Reuse independent SA-MA-SUPPLEMENT.md@8c61af6b5e0edc2827aa27150e47172fc5d20246; no unnecessary diagram re-review.
No author private transcripts imported; author 38 green groups do not determine this verdict.

## Original findings
| Finding | Status at bd96 | Independent resolution |
| --- | --- | --- |
| F01 P2 | CLOSED for original finding cases | Original changed merchant/instant, intra-batch changed money and repeated pending ID cases now block correctly. Additional source/display preservation and changed refund reference tests pass. New F04/F05 below concern adjacent remaining contract errors. |
| F02 P2 | CLOSED | Original excluded-target case blocks; restoring included root permits one real retained transaction. No original zero-add disappearance reproduced. |
| F03 P2 | CLOSED | Original February 30 rejects; independently tested century leap, valid leap, invalid clock and offset-minute boundaries pass. |

The initial REPORT.md@abde0ed93a1e24139b3f97dfd67184a2f3c7716d remains immutable historical REQUEST CHANGES; closing its concrete cases does not imply approval of the revised whole artifact.

## Remaining actionable findings

### F04 — P2: canonicalize provider IDs before identity lookup
File: examples/issue-5-acceptance/ui/prototype.html:20; related row construction :68–69.
Exact reviewed SHA: bd96d6c5b4ac4fa241e92f609f08be42f0ccb53b.
Reproduction: fresh ledger with existing provider ID X. Import one synthetic WECHAT row with transaction_id equal to three characters “ X ” (ordinary outer spaces), spend settled 10.00 CNY, 2026-10-01T10:00:00+08:00, source merchant Example Cafe, blank original/location.
Expected: canonical ID X resolves existing immutable observation; duplicate requires explicit link/skip and no new Entry.
Actual: no duplicate warning, confirmation automatically enabled; confirmation adds a fourth Entry and reports 新增 1 笔.
Root cause: sourceIdentity serializes raw id without the MODULE-defined normalization, and r.id uses raw truthiness to choose strong/candidate path.
Impact: the prototype represents the same known source transaction as a new financial record; amounts can be counted twice despite supposedly corrected identity behavior.
Fix: one explicit provider-ID canonicalization for transaction ID and original refund reference: NFC plus Unicode outer whitespace trim, preserving case/punctuation/internal content; normalized empty is no ID. Use the canonical value consistently in identity lookup, same-batch matching and reference comparison. Add stored/same-batch/canonical-reference checks; no production HMAC/native persistence required.
Acceptance: MODULE-DESIGN.md Timestamp, merchant and source rules specifies exact NFC ID with outer whitespace trimmed only; I04 unique source identity; UI-Q4/Q5.
Evidence: r2-independent-checks.json identity-outer-whitespace and identity-canonical-no-duplicate-entry (two failures, one root finding).

### F05 — P2: keep refund resolution independent of duplicate-candidate decisions
File: examples/issue-5-acceptance/ui/prototype.html:80; commit behavior :93 and guard :90.
Exact reviewed SHA: bd96d6c5b4ac4fa241e92f609f08be42f0ccb53b.
Reproduction: fresh ledger settled total ¥106.00. Import two identical no-ID synthetic refund rows: blank transaction_id, blank original_transaction_id, refund settled -1.00 CNY, 2026-10-05T10:00:00+08:00, merchant No-ID Refund. First: include + 保留待关联. Second is now candidate: choose include + separate (“确认是另一笔支出”).
Expected: keepSeparate is valid for distinct purchases/refunds but a newly retained refund must independently choose a valid original or retainUnresolved. With both unresolved total stays ¥106.00, and both show unresolved.
Actual: confirm enabled; resulting total ¥105.00, five entries and only one unresolved refund. The second negative Entry has neither original link nor unresolved flag and is counted as settled.
Root cause: issue=candidate suppresses issue=refund; valid() accepts separate without refund decision, while commit derives original/unresolved only from issue==='refund'. The same mutually exclusive state also renders a refund candidate as “another spend”.
Impact: a demonstrated supported no-ID review path changes financial totals without a reviewed refund link, violating the central unresolved/cap invariant. This is an affected-path regression, not a request for native storage or additional product scope.
Fix: model duplicate decision and refund resolution separately. A candidate linked to an existing transaction retains that transaction; a candidate kept separate as a new refund must choose original or unresolved. Validate this invariant immediately before commit and use refund-specific labels. Cover within-batch and stored no-ID candidate cases, keepSeparate plus link/unresolved, and cap checks.
Acceptance: MODULE-DESIGN I05, exact identity step 4, Refund algorithm and UI contract; UI-Q4/Q5.
Evidence: r2-independent-checks.json no-ID-refund-keep-separate; actual local r2-refund-candidate.png.

No P0/P1 asserted for this bounded design simulation. Both P2 require correction and exact-source independent review or individually explicit Owner disposition; no waiver inferred.

## Actual independent checks
Own Chrome run on immutable isolated source: **27 PASS / 3 FAIL**, with the three failed assertions grouped into two findings above.
PASS includes all original five negative cases, F02 valid target recovery and one-entry result, invalid/valid Gregorian century/leap/clock/offset boundaries, original source matching after edited display/category/location, changed refund reference conflict, distinct no-ID spends retained, category override, optional current-location cancellation/manual save, whole-batch storage failure and renewed-decision retry, 320/390/1280 layout and keyboard focus, zero observed HTTP requests/page errors.
Independent script and JSON publish alongside this report. Did not rerun author scripts or overwrite author files/reports/screenshots.
Actual two screenshots were opened/visually inspected. Corrected conflict text fits 390px and confirmation blocks; refund candidate reproduces the guard defect. Reviewer screenshots are LOCAL_ONLY with hashes.
Native SwiftUI/Core Data/GPS/VoiceOver/device/provider compatibility/crash/disk/backup/migration/performance remain NOT_RUN. The prototype's explicit synthetic/CNY/safe-integer/fixed-namespace/virtual-permission/in-memory limitations remain; none excuses the demonstrated contract-state defects inside its supported simulation.

## Governance and next action
Master should route only F04/F05 to original UI producer, then provide actual new Handoff and exact source for affected-diff review, preserving F01–F03 regression coverage.
UI Profile remains PROPOSED. Actual material UI approval, separate Owner SA/MA/UI scores and per-Skill acceptance, and original provenance equivalence/attestation questions remain pending. Original historical SYSTEM tasks were not in Reviewer's observed live tree; no new UUID, public human-message permalink or external historical inspector is invented. Retain recorded RUNTIME_DISPATCH scope.
No Design Gate readiness, coding authorization, Owner acceptance, merge, close, release or PQA action. Reviewer did not edit specialist sources.

