# UI rework — independent findings F01–F03
schema_version: padf.agent-dispatch/v1
dispatch_id: I5-UI-002
context_id: PADF-ISSUE-5-EXPENSE-ACCEPTANCE
original_feature_id: EXPENSE-ACCEPTANCE-005
target_role: ui-ux-designer
target_skill_ref: .agents/skills/ui-ux-designer/SKILL.md@f1b6a6e4a90d547127bd95bceaa12880a7c39855
execution_mode: RUNTIME_DISPATCH
initiated_by: MASTER_RUNTIME_TOOL
runtime_action: collaboration.followup_task to existing /root/ui_designer; producer continuation, not a newly claimed fresh context.
depends_on_dispatch_ids: [I5-REVIEW-001]
prior_handoff_ref: review/HANDOFF.md@77f1982d83b904109c0b210dab1e64ae5f0e38fa
prior_reconciliation_ref: MASTER-REVIEW-RECONCILIATION-R1.md@fe49926e991c146b71ed6a20aba9d4b6612706c5
review_report_ref: https://github.com/leohuqi/Personal_AI_Development_Framework/blob/abde0ed93a1e24139b3f97dfd67184a2f3c7716d/examples/issue-5-acceptance/review/REPORT.md
original_ui_source_sha: 367bdd2dfc46a868290750f8088da9cdb53575a9
profile_ref: UI-PROFILE.md@d7e9c679a0a435310ef76d63432917d7e1656078
module_source_sha: ad5a536bf2f6636d53ba51452cc555d54b82456b
system_baseline_sha: f4dbf0d3fac707db1b57252c529618c38d26f0bc
delivery_branch: acceptance/issue-5-real-orchestration
delivery_pr: https://github.com/leohuqi/Personal_AI_Development_Framework/pull/6

## Bounded authorized task
Read this Dispatch and exact independent report/repro script. Correct only the three actual P2 contract-representation defects in own UI prototype, corresponding regression tests/spec/manifest/receipt/Handoff. Do not edit Reviewer files or another role's designs. Original task authorizes corrective design prototype code, not production app implementation. Keep actual approved SYSTEM/MODULE policies and Profile tokens unchanged (Profile remains PROPOSED).
F01: compare complete immutable economics separately from edited display fields against existing and same-batch observations. Source fields from MODULE identity algorithm: kind, currency, minor units, exact source instant/timezone/precision, normalized source merchant, original refund reference and eligibility/status, within the synthetic namespace/provider scope. Existing same ID with different economic source must be SOURCE_CONFLICT. Validate non-settled/invalid rows first and never overwrite their blocker with duplicate classification. Keep all source identity/observation values stable across user merchant/category/location edits.
F02: validate actual duplicate target ID/row token against final included plan during review/confirmation. Excluded/absent/invalid target cannot produce successful zero-entry processing of an included transaction; reclassify safely with explicit review or block pending a valid new decision. No silent transaction disappearance or indiscriminate same-ID skip. Reproduce exact Reviewer same-batch cases.
F03: strictly validate Gregorian date/calendar/time/offset components and RFC3339 before deriving an instant; reject invalid normalized dates such as February 30. Include leap-year/date/time/offset range counterexamples; match MODULE contract.
Add meaningful regression cases for every independently reported counterexample, including changed merchant/time, conflicting same-batch amount, nonsettled repeated ID, excluded duplicate target and impossible date. Also preserve existing main-path/20 grouped checks. Use actual browser interactions, keep tests/reports reproducible and honest; no need to add native/Core Data/server work.
Re-run affected checks and actual render inspection if visual output changes. Update local outputs/issue-5/ui source/tests/reports/manifest; PNGs may remain actual LOCAL_ONLY with hashes, no slow binary uploads. Source scripts/spec/docs should explain exact corrected boundaries rather than falsely claiming original tests covered them.
Use exact clock receipt I5-UI-EXEC-002 with canonical existing runtime path /root/ui_designer and actual followup initiator. Publish new exact source commit on assigned branch from current live head (preserve all Master/review records), then separate HANDOFF-V2.md with report/finding IDs, exact new source, tests and remaining approval gaps. Never rewrite immutable first review result or treat self-check as independent re-review.
Return new source SHA + Handoff URL promptly; final independent Reviewer will recheck actual changed source. No Owner score, material UI approval, Design Gate, merge, deployment, PQA changes or extra feature scope. Preserve current look; priority is correct represented contracts and clean regression evidence.
