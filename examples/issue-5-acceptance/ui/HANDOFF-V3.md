# UI Designer → Master — bounded F04/F05 correction
schema_version: padf.agent-handoff/v1
handoff_id: I5-UI-HO-003
handoff_kind: DESIGN
context_id: PADF-ISSUE-5-EXPENSE-ACCEPTANCE
original_feature_ids: [EXPENSE-ACCEPTANCE-005]
linear_issue: null (GitHub Issue 5 tracker)
sender: ui-ux-designer /root/ui_designer
receiver: master-orchestrator /root
created_at: 2026-10-16T09:52:34Z (actual clock read)
dispatch_id: I5-UI-003
execution_id: I5-UI-EXEC-003 (authored label, not runtime UUID)
runtime_task_id: /root/ui_designer
runtime_tool: collaboration.followup_task
execution_mode: RUNTIME_DISPATCH
initiated_by: MASTER_RUNTIME_TOOL
context_type: existing original producer continuation; no new fresh-session claim
dispatch_ref: UI-REWORK-R2-DISPATCH.md@d43391f4c219338e381fc1342fc359f0f9be2f30
launch_ref: UI-REWORK-R2-LAUNCH.md@9fdbcb58b7f64ab40bd7385f9fc70b10ec1bd9f9 (actual path/ref fetched)
skill_ref_used: .agents/skills/ui-ux-designer/SKILL.md@f1b6a6e4a90d547127bd95bceaa12880a7c39855
skill_blob_sha: 65f2f89c80ee71d0fee97c76759b7d8549761fda
prior_independent_report: review/REPORT-V2.md@6dbe1a2e963d3697231d2c823107901a978c034e
prior_review_handoff: review/HANDOFF-V2.md@88925ca449e3da39563c0bbd4466b13bf5cacce5
prior_master_reconciliation: MASTER-REVIEW-RECONCILIATION-R2.md@5e72a94150a00abccb568df7287889776e20dd10
prior_ui_source: bd96d6c5b4ac4fa241e92f609f08be42f0ccb53b
base_sha: 9fdbcb58b7f64ab40bd7385f9fc70b10ec1bd9f9
artifact_source_sha: 86a71f24fa612403cb741d859251b2f715347f3d
delivery_branch: acceptance/issue-5-real-orchestration
delivery_pr: https://github.com/leohuqi/Personal_AI_Development_Framework/pull/6
system_baseline_ref: SYSTEM-BASELINE.md@f4dbf0d3fac707db1b57252c529618c38d26f0bc
system_baseline_status: APPROVED by actual OWNER-SYSTEM-APPROVAL.md@05ba2117e2fbb5ac924913accb76b763a2fc268c
module_design_ref: module@ad5a536bf2f6636d53ba51452cc555d54b82456b
project_ui_profile_ref: UI-PROFILE.md@d7e9c679a0a435310ef76d63432917d7e1656078
project_ui_profile_status: PROPOSED (unchanged)
prototype_level: L3
status: COMPLETED_BOUNDED_CORRECTIVE_DESIGN / READY_FOR_MASTER_RECONCILIATION
independent_rereview: PENDING
receiver_ack: PENDING
owner_ui_approval_and_scores: PENDING
coding_authorized: false

## Exact deliverables
- [Corrected self-contained prototype](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/86a71f24fa612403cb741d859251b2f715347f3d/examples/issue-5-acceptance/ui/prototype.html).
- [Updated UI/API/source-state design explanation](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/86a71f24fa612403cb741d859251b2f715347f3d/examples/issue-5-acceptance/ui/UI-DESIGN.md).
- [21-group actual F04/F05 regression results](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/86a71f24fa612403cb741d859251b2f715347f3d/examples/issue-5-acceptance/ui/rework-r2-test-report.json) and [reproducible actual browser script](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/86a71f24fa612403cb741d859251b2f715347f3d/examples/issue-5-acceptance/ui/verify-rework-r2.cjs).
- Actual reexecution results for [14 main groups](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/86a71f24fa612403cb741d859251b2f715347f3d/examples/issue-5-acceptance/ui/interaction-test-report.json), [6 supplementary groups](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/86a71f24fa612403cb741d859251b2f715347f3d/examples/issue-5-acceptance/ui/adversarial-test-report.json), [18 F01–F03 groups](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/86a71f24fa612403cb741d859251b2f715347f3d/examples/issue-5-acceptance/ui/rework-test-report.json). Their existing scripts remain at this exact source.
- [Execution receipt V3](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/86a71f24fa612403cb741d859251b2f715347f3d/examples/issue-5-acceptance/ui/EXECUTION-RECEIPT-V3.md), [25-artifact SHA-256/publication manifest](https://github.com/leohuqi/Personal_AI_Development_Framework/blob/86a71f24fa612403cb741d859251b2f715347f3d/examples/issue-5-acceptance/ui/ARTIFACT-MANIFEST.json).

## Finding mapping and actual results
F04: canonical provider IDs and original references use one NFC + outer Unicode White_Space trim function. Case/punctuation/internal content are preserved; canonical empty is no strong ID. Store/same-batch identity, immutable source economics/refund hint and 256-byte checks use canonical values. Exact Reviewer “ X ” case now shows duplicate, requires explicit link and retains three entries. Stored/same-batch/NFC/Unicode trim/empty/case/internal/original-reference cases all executed.
F05: duplicate decision and `refundChoice` are independent. Every retained new refund requires valid original or explicit unresolved. LinkExisting retains concrete target's original state and inserts no new refund; candidate keepSeparate has refund-specific label and requires its own resolution. Exact two no-ID -1 cases now block after separate alone; two explicit unresolved choices retain net106 with two unresolved refunds. Stored candidates, separate+original, duplicate links and excluded-target combinations pass.
Final retained plan resolves stored or included new-original row/duplicate aliases. Aggregate new linked refunds share the same original's remaining cap; duplicate links do not reserve twice. Missing/excluded/nonpositive/mismatched originals block. Caps and decisions revalidate immediately before the simulated whole-array save. Tests cover existing/new-original caps, exclusion, aliases and a deliberate scripted state injection while saving (not an ordinary user action) proving final revalidation leaves ledger unchanged.

**59 grouped browser checks PASS**: 14+6+18 prior groups actually rerun, plus21 new groups. The 22 date vectors remain inside the18 F01–F03 groups, not extra counted groups. Reports record actual final timestamps/browser versions and zero observed HTTP requests/page errors. All original F01–F03 concrete cases remain covered. Prior38 green groups did not cover F04/F05; this omission is explicitly acknowledged. Independent R1/R2 REQUEST CHANGES histories remain unchanged, and author PASS is not independent re-review/acceptance.

## Local prototype and rendering
Local entry `/Users/leohu/Documents/Codex/2026-10-16/referenced-chatgpt-conversation-this-is-an/outputs/issue-5/ui/prototype.html`.
Six actual PNGs in same directory: ledger-mobile, manual-mobile, import-mobile, review-conflict-mobile, ledger-wide, refund-candidate-mobile (all .png). New refund-candidate screenshot scrolls to the second row and visibly shows separate duplicate/refund controls with correct “另一笔退款”/“保留待关联” labels. New candidate and refreshed import images were actually opened/inspected; no clipping, normal internal scrolling and visible confirmation. Profile/tokens unchanged. All PNGs **LOCAL_ONLY**; absolute paths/hashes in manifest. No binary upload or remote PNG link claimed. Published tests reproduce local images.

## Boundaries and transfer
Only own ui/ source/docs/reports/manifest/receipt changed remotely; local screenshots refreshed. Preserve Reviewer/Master/Architect/Owner histories. Original OWNER-EVALUATION.json remains unchanged. Master's extra local OWNER-EVALUATION-V2.json was not edited, scored or put into author source tree/manifest; it is not author acceptance evidence.
SYSTEM/MODULE policies unchanged; canonical structured equality is still synthetic, not HMAC/native persistence. CNY/fixed namespace/safe-integer input/virtual permissions/page-memory limits remain. Native SwiftUI/Core Data/GPS/device/VoiceOver/real providers/crash/disk/security/backup/migration/performance remain NOT RUN. No new material visual decision or feature scope; Profile remains PROPOSED.
No known unresolved supported-source contract conflict after author checks. Last independent result remains REQUEST CHANGES until exact new-source re-review. Master must reconcile actual Handoff/source, route independent affected-diff review and obtain pending Owner visual approval and separate quality scores. No DESIGN_READY, coding authorization, acceptance, PQA, merge, release, scheduler, production or Issue closure performed.
pending_message_ids: []
next_responsible_role: master-orchestrator
next_authorized_action: fetch exact source/Handoff, verify baseline/profile and hashes, ACK/NEEDS_REFINEMENT; route independent review
stop_conditions: material baseline/approval drift, new contract conflict, missing required independent review/Owner decisions, unapproved scope or production coding
workspace_ownership: own outputs/issue-5/ui only; local Owner V2 extra excluded
