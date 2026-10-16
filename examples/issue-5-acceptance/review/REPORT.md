# Independent DESIGN review — round 1
schema_version: padf.independent-design-review/v1
context_id: PADF-ISSUE-5-EXPENSE-ACCEPTANCE
original_feature_id: EXPENSE-ACCEPTANCE-005
linear_issue: N/A; GitHub Issue 5 is tracker
dispatch_id: I5-REVIEW-001
execution_id: I5-REVIEW-EXEC-001 (review-local label, not a runtime UUID)
reviewer_runtime_task: /root/design_reviewer
mode: DESIGN
verdict: REQUEST CHANGES
reviewer_is_producer: false
coding_authorized: false

## Scope and exact revisions
PR: https://github.com/leohuqi/Personal_AI_Development_Framework/pull/6
Live review-start head independently fetched: 3f710113261783de2d5ccf710a3674ddb8c5a403.
Base: f1b6a6e4a90d547127bd95bceaa12880a7c39855.
The exact compare has 37 commits and only added examples/issue-5-acceptance files; no framework or production app changes. Reviewed the changed artifacts and relevant surrounding pinned contracts, not author transcripts.
Initial input was only immutable DESIGN-REVIEW-DISPATCH.md@fe8076807c3bf1a2901b7a3b31120c638b0f3cfe. Own Skill independently fetched at base; blob ec5d9f21b52a2273e8b899f436e19b0243c27e0d. First own clock observation: 2026-10-16 09:12:11 UTC; this is not a guessed launch time.

Reviewed design sources:
- SYSTEM baseline/model: f4dbf0d3fac707db1b57252c529618c38d26f0bc; current-head blobs independently match 2c404e302213cc0968d71ffd8d986473cce2c8f0 / 25d3617848dcd2d8f97f36efa0043922dacafead.
- Actual recorded Owner SYSTEM/default-style decision: OWNER-SYSTEM-APPROVAL.md@05ba2117e2fbb5ac924913accb76b763a2fc268c. It transcribes a human chat statement; no public message UUID independently accessible here.
- SYSTEM figures/viewer: 123aa014962289feccf527f8e063a19299c1e975; verification source 0f6c7b6f45a54dcc23e8dba0f39582d283d36e93; final handoff 73bd942a79cb0e8a0f15c592e924f791917e20ae.
- MODULE design/interfaces/model/state/figures/tests: ad5a536bf2f6636d53ba51452cc555d54b82456b; handoff dba8329b36caa881098df61f517c78838776aeed.
- UI design/prototype/tests: 367bdd2dfc46a868290750f8088da9cdb53575a9; Profile/tokens d7e9c679a0a435310ef76d63432917d7e1656078; handoff d2d6d4239bd03dd337985b0b58d2df1ad1896918.

## Independent findings
All locations below use repository-relative paths and one-based original source lines at the exact UI source above. No specialist source was edited by Reviewer. These are defects in the prototype's represented contracts; no native application implementation is requested.

### F01 — P2: compare complete immutable economics and preserve non-settled blockers
Location: examples/issue-5-acceptance/ui/prototype.html:35.
Reproduction A: start fresh, import synthetic WECHAT row X,,spend,settled,10.00,CNY,2026-10-05T10:00:00+08:00,Completely Different Merchant,. Existing X is October 1 and another merchant. Actual UI says duplicate and permits “关联已有记录，不新增”; confirmation succeeds without new entry. Expected SOURCE_CONFLICT, because same identity with changed immutable merchant/instant must not be represented as exact duplicate.
Reproduction B: same fresh file contains NEW spend 1.00 October 5 Shop A, then NEW spend 2.00 October 6 Shop B. Second is labelled duplicate, not conflict.
Reproduction C: existing X as pending 10.00 October 1 is labelled duplicate and may be included. The later found-ID assignment overwrites nonsettled.
Impact: the L3 demonstration teaches acceptance/linking of inconsistent or ineligible financial evidence, despite UI-DESIGN claiming these guards match MODULE.
Fix: retain immutable economics separately from edited display fields; compare kind/currency/amount/instant/source merchant/original refund reference/status against stored and earlier same-batch observations; preserve non-settled invalidity with higher priority; require explicit conflict exclusion. No HMAC/native persistence implementation needed in this demonstration.
Criterion: UI-Q4/Q5; MODULE-DESIGN.md invariants I02/I04 and exact identity algorithm steps 3–4, PROFILES settled-only rule.
Evidence: independent-checks.json strong-id-economic-conflict, intra-batch-conflict, nonsettled-source-guard; local same-id-changed-economics.png.

### F02 — P2: validate the selected duplicate target against the final included plan
Location: examples/issue-5-acceptance/ui/prototype.html:45 (related classification :35 and guard :42).
Reproduction: fresh file with two identical new SAME spend 1.00 rows; exclude row 1; choose include + “关联已有记录，不新增” for row 2. Actual confirm stays enabled, closes successfully with “新增 0 笔”; ledger stays at three records and no SAME entry exists.
Impact: an included transaction silently disappears while the UI reports processing success. This is distinct from F01: it occurs even when both observations have exactly equal economics.
Fix: store an explicit candidate target token/ID; resolve against existing entries and final included same-batch plan. When a target is excluded or absent, promote the remaining row to new or require a valid new decision. Do not skip merely because an earlier raw row shares its ID.
Criterion: UI-Q4/Q5; MODULE exact identity step 3 and writer revalidation step 6.
Evidence: independent-checks.json excluded-target-duplicate.

### F03 — P2: reject impossible calendar dates before allowing import confirmation
Location: examples/issue-5-acceptance/ui/prototype.html:35.
Reproduction: fresh file INVALID-DATE,,spend,settled,1.00,CNY,2026-02-30T10:00:00+08:00,Shop,. Actual UI displays February 30 and enables confirmation. Date.parse normalizes this input rather than rejecting it.
Impact: invalid immutable source timestamps are represented as valid transactions; chronological and identity rules diverge from the typed design.
Fix: validate Gregorian calendar components, time and offset ranges strictly before deriving instant; reject normalization and show invalid row requiring exclusion. Add boundary cases for leap years and offset/time ranges.
Criterion: UI-Q4/Q5; MODULE-DESIGN.md Timestamp rules explicitly reject invalid calendar dates; PROFILES strict RFC3339.
Evidence: independent-checks.json calendar-date.

No P0/P1 asserted for this bounded nonproduction design artifact. P2 findings require correction and fresh independent review, or individually explicit Owner disposition; Master has requested correction. No automatic risk acceptance.

## Actually reproduced checks
PASS: category override survives merchant edits; manual save remains possible after cancelling optional location; storage-full import failure leaves ledger unchanged; retry demands renewed choices; page has no horizontal overflow at 320/390/768/1280; keyboard Enter opens and Escape returns focus; SYSTEM and MODULE viewer SVGs rendered in actual Chrome.
FAIL: five independent cases grouped into F01–F03 above.
The report JSON records actual Chrome version and execution timestamp. Network/page-error observations are recorded, rather than inferred from source.
Execution setup: bundled Playwright plus installed Chrome. Sandbox Chrome launch initially failed; authorized local browser run succeeded with host execution. This is an environment issue, not a design failure.
Reviewer did not rerun author scripts or overwrite author reports/PNGs. Reproduction script is independently authored. All uploaded evidence is textual; reviewer screenshots are actual LOCAL_ONLY outputs.
NOT_RUN in this initial bounded round: exhaustive inspection of every diagram node/zoom interaction and geometry; native SwiftUI/Core Data/OS GPS/device/VoiceOver/disk crash/backup/migration/performance/provider compatibility; production implementation does not exist. Author green test reports are locators and evidence of claimed execution, not independently inherited PASS.

## SA/MA/UI criterion trace (professional observations, no Owner scores)
| Criterion | Exact source above / independent observation |
| --- | --- |
| SA-Q1 | SYSTEM baseline ADR-001 specifies Xcode/Swift/SDK/minimum OS and alternatives. Compatibility explicitly deferred to implementation; no arbitrary server infrastructure. |
| SA-Q2 | ADR-002/003 and SYSTEM-MODEL separate canonical persistence, untrusted imports, use cases and OS boundaries; explicit failure/atomicity conventions. |
| SA-Q3 | ADR-006 defines package ownership and inward dependencies; MODULE retains that topology. |
| SA-Q4 | Actual editable viewer/SVG/PNG sources exist; representative viewer independently rendered. Complete pin/tool/geometry audit not independently rerun in this round. |
| SA-Q5 | ADR-004/005/007 specify sensitive-data provenance/protection, optional location, encryption/recovery, migration/rollback and measurable NFR targets; device validation honestly NOT_RUN. |
| MA-Q1 | MODULE pins exact approved SYSTEM and Owner decision; stack and no-backend boundaries match. |
| MA-Q2 | CODE-STRUCTURE and INTERFACES provide concrete owners/ports/DTOs; no production implementation claim. |
| MA-Q3 | CORE-DATA-MODEL defines 12 entities, identities/observations/receipts/refund/provenance separation and constraints; prose defines transactions/revisions/restore and stable errors. No independent production database validation possible. |
| MA-Q4 | Five editable diagrams and viewer exist; representative SVG independently rendered. Exhaustive source-to-node audit remains not rerun, not inferred from green author logs. |
| MA-Q5 | TEST-PLAN specifies adversarial overlap/refund/cancellation/restore boundaries and persistent-store tests; synthetic vectors explicitly do not prove durability. |
| UI-Q1 | UI-DESIGN has focused personal offline capture/reconciliation journeys, information architecture and alternative rationale. |
| UI-Q2 | Exact PROPOSED Profile/token revision pinned in prototype; approval still pending. No Figma/design-system provenance invented. |
| UI-Q3 | Actual readable mobile/wide source and common state inventory; independent responsive/focus checks passed. |
| UI-Q4 | L3 is genuinely clickable, with real file input/decisions/errors and editable source; F01–F03 make critical transitions incorrect. |
| UI-Q5 | Optional consent/current-vs-historical labels, explicit categories and keyboard behavior are useful; financial/timestamp source mapping has confirmed defects. Native accessibility untested. |

## Orchestration evidence audit (separate from quality)
Read live Issue 5, pinned AGENTS/own Skill/design-gate/agent-dispatch/runbook/rubric and actual launch/dispatch/reconciliation files. Compared real Git commit ancestry in base-to-head compare. Durable chain is SYSTEM dispatch/proposal → blocked reconciliation → actual later Owner decision/default style → refinement → reconciliation → MODULE dispatch/handoff/reconciliation → UI dispatch/handoff/reconciliation → this fresh review dispatch.
The historical SYSTEM diagram/style block is preserved, not retroactively PASS. Later Owner decision applies to unchanged SYSTEM baseline; PROPOSED historical document label is not itself missing approval.

Independent runtime observation using collaboration.list_agents returned /root, /root/design_reviewer, and completed /root/module_architect and /root/ui_designer with their artifact/handoff revisions. These corroborate actual current distinct runtime tasks and completion, not separate human-owned chats. /root/solution_architect and /root/system_visuals were not in the current live-tree return, so earlier launch/completion are supported by durable tool-return receipts and reconciliations but not independently re-inspected as live tasks by this reviewer. Preserve RUNTIME_DISPATCH recorded origin; do not relabel as HUMAN_RELAY or fabricate UUID/external inspector. Same GitHub account and role labels alone were not used as proof. Parent launch-time events and absence of private human message permalink impose objective provenance limits; Owner fresh-session equivalence/attestation remains a separate decision.

OC-01/03/04: durable chronology/source dependencies present; source inspection supports bounded sequencing, with early missing render correctly blocked and later refined.
OC-02/05: live MODULE/UI task corroboration plus current own task; historical SYSTEM live task inspection unavailable as above; recorded modes honest within stated scope.
OC-06: gate remains BLOCKED; initial independent review now REQUEST CHANGES. No coding authorization inferred.

## Remaining decisions and next action
Master routes bounded UI correction for F01–F03; independent Reviewer rechecks exact changed source and affected invariants, including main-path regression. This report remains the historical first-round result.
UI Profile is still PROPOSED; actual material UI approval is mandatory. Owner SA-Q/MA-Q/UI-Q scores and separate per-Skill ACCEPT/CHANGES_REQUESTED/DEFER remain pending; this report assigns none.
Earlier human SYSTEM statement is recorded faithfully but this reviewer has no public original-chat attestation endpoint. Do not invent it.
This report does not mark Design Gate DESIGN_READY, authorize coding, accept Issue 5, merge/close a PR or touch PQA.
