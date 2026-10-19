# UI bounded correction F04/F05 Dispatch
schema_version: padf.agent-dispatch/v1
dispatch_id: I5-UI-003
context_id: PADF-ISSUE-5-EXPENSE-ACCEPTANCE
original_feature_id: EXPENSE-ACCEPTANCE-005
sender: master-orchestrator /root
target_role: ui-ux-designer
target_runtime: /root/ui_designer
execution_mode: RUNTIME_DISPATCH
context_type: existing original UI producer continuation; not fresh independent session
skill_ref: .agents/skills/ui-ux-designer/SKILL.md@f1b6a6e4a90d547127bd95bceaa12880a7c39855
skill_blob_sha: 65f2f89c80ee71d0fee97c76759b7d8549761fda
authorizing_issue: https://github.com/leohuqi/Personal_AI_Development_Framework/issues/5
prior_actual_review: review/REPORT-V2.md@6dbe1a2e963d3697231d2c823107901a978c034e
review_handoff: review/HANDOFF-V2.md@88925ca449e3da39563c0bbd4466b13bf5cacce5
master_reconciliation: MASTER-REVIEW-RECONCILIATION-R2.md@5e72a94150a00abccb568df7287889776e20dd10
prior_ui_source: bd96d6c5b4ac4fa241e92f609f08be42f0ccb53b
coding_authorized: false

## Task Contract
Read actual immutable Reviewer report/Handoff and own pinned Skill. Correct only supported synthetic prototype F04/F05, preserving F01–F03 and normal workflows.
F04: canonical provider ID + original reference with MODULE prescribed NFC and Unicode outer whitespace trim only; case/internal text preserved; canonical empty -> no strong ID. Use consistently in store/row identity, same batch, source economics/refund original matching; add actual stored/same-batch/NFC/empty/case/internal/reference regression.
F05: separate duplicate-candidate decision from new-refund resolution. keepSeparate for a refund requires independently valid original or retainUnresolved; linkExisting uses actual existing target, not a new unresolved/settled entry. Validate immediately before commit and cap against final retained plan; accurate refund labels. Cover the exact reviewer two-no-ID-refund case plus stored candidate, separate unresolved/link, duplicate link, cap/excluded-target combinations. Do not widen to native persistence/HMAC or provider formats.

Source SYSTEMf4dbf0d3fac707db1b57252c529618c38d26f0bc, Owner record05ba2117e2fbb5ac924913accb76b763a2fc268c, MODULEad5a536bf2f6636d53ba51452cc555d54b82456b, Profiled7e9c679a0a435310ef76d63432917d7e1656078 unchanged PROPOSED. No style/material baseline/production change. Prior 38 author groups and actual Reviewer counterexamples must run; add meaningful new regressions. Report actual results, no inherited PASS.

## Deliver
Own ui/ only: corrected prototype/source docs, source manifest, actual browser reports/reproducible new test script, EXECUTION-RECEIPT-V3.md and separate immutable HANDOFF-V3.md. Preserve all prior review/producer historical reports/Handoffs, original Owner JSON and prior launch records; do not edit Master/Reviewer/Architect source. New Owner V2 sheet may be local Master extra—do not add it as authoritative self-scored evidence. Screenshots may remain honest LOCAL_ONLY with hashes. Correct source commit separate from Handoff. Publish via GitHub connector preserving live-head additions with expected-head non-force updates; no merge/force reset. Actual launch receipt will follow this Dispatch, cite the correct actual commit if known or pending until verified. Execution label I5-UI-EXEC-003 is authored, not UUID.
Return exact source/Handoff SHA for Master dependency reconciliation then mandatory independent affected-source review. No Owner scoring/Profile approval, DESIGN_READY, native coding, QA/PQA, release, Issue close, scheduler or external messages.
