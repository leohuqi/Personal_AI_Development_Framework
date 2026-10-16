# UI/UX L3 — durable Master Dispatch and bounded Task Contract
schema_version: padf.agent-dispatch/v1
dispatch_id: I5-UI-001
context_id: PADF-ISSUE-5-EXPENSE-ACCEPTANCE
original_feature_id: EXPENSE-ACCEPTANCE-005
target_role: ui-ux-designer
target_skill_ref: .agents/skills/ui-ux-designer/SKILL.md@f1b6a6e4a90d547127bd95bceaa12880a7c39855
target_skill_blob_sha: 65f2f89c80ee71d0fee97c76759b7d8549761fda
task_class: L
execution_mode: RUNTIME_DISPATCH
initiated_by: MASTER_RUNTIME_TOOL
repository: leohuqi/Personal_AI_Development_Framework
delivery_branch: acceptance/issue-5-real-orchestration
delivery_pr: https://github.com/leohuqi/Personal_AI_Development_Framework/pull/6
depends_on_dispatch_ids: [I5-MODULE-001]
prior_handoff_ref: https://github.com/leohuqi/Personal_AI_Development_Framework/blob/dba8329b36caa881098df61f517c78838776aeed/examples/issue-5-acceptance/module/HANDOFF.md
prior_reconciliation_ref: https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b1452c10d3d6f42d8828ac36aabffbf8cd1215fe/examples/issue-5-acceptance/MASTER-MODULE-RECONCILIATION.md
system_baseline_ref: examples/issue-5-acceptance/system/SYSTEM-BASELINE.md@f4dbf0d3fac707db1b57252c529618c38d26f0bc
system_owner_approval_ref: https://github.com/leohuqi/Personal_AI_Development_Framework/blob/05ba2117e2fbb5ac924913accb76b763a2fc268c/examples/issue-5-acceptance/OWNER-SYSTEM-APPROVAL.md
module_source_sha: ad5a536bf2f6636d53ba51452cc555d54b82456b
ui_level: L3
ui_profile_status: ABSENT → create PROPOSED design deliverable, never invent APPROVED status.
ui_profile_creation_scope_ref: https://github.com/leohuqi/Personal_AI_Development_Framework/blob/b1452c10d3d6f42d8828ac36aabffbf8cd1215fe/examples/issue-5-acceptance/MASTER-MODULE-RECONCILIATION.md
Master rationale: SYSTEM actually approved, completed MODULE Handoff retrieved/reconciled. UI must prove complex merchant/category/location/import/refund state interactions, not supply static mock screenshots. Original human task expressly requests profile/philosophy/concept/high-fi/working prototype; author proposed profile under that bounded design authorization, leave new material visual baseline approval for actual Owner after seeing outputs.

## Resolve sources independently
Initial input only this URL. Read live Issue 5, pinned AGENTS/own Skill/UI/profile/handoff contracts. Read exact approved SYSTEM and Owner record; only affected MODULE design, typed APIs, STATE-CONTRACT, CORE-DATA-MODEL, PROFILES/test plan at module source SHA above. No Master/architect transcript. Do not reselect architecture or silently alter interface/financial/provenance rules.
Existing actual project UI/source does not exist. Per own Skill, create proposed project-local profile and explain lack of observed app; no fabricated Figma/source/approval. User approved default DIAGRAM style, not an app visual profile. Profile authoring is in requested pilot scope, final approval remains PENDING.

## Produce own professional design package — examples/issue-5-acceptance/ui/
L1: project-specific philosophy, primary user journey/IA/concepts and justified alternatives.
L2: coherent proposed UI Profile with actual token/component catalog, spacing/typography/color semantic roles, navigation/density/responsive/accessibility/error/loading/empty/permission/success states; high-fi editable source and actual 390px mobile plus wider-screen render. Chinese-primary user-facing prototype is appropriate to this user and bill context; technical identifiers remain stable. This is iPhone-first native-system design demonstrated in HTML, not an unrelated dashboard.
L3: genuinely clickable self-contained local HTML/CSS/JS prototype, synthetic data only, no server/install/network/telemetry. Must actually test:
- manual amount/merchant/category entry; deterministic merchant suggestion with explicit editable dropdown override and no silent replacement of user choice;
- historical source/user-entered location vs explicitly consented current observation, deny/unavailable/reduced-accuracy states; imported old rows never trigger GPS or claim current fix is historical;
- synthetic user-exported file review (bundle explicit fake WeChat/Alipay fixtures; local file input/demo selection and invalid/unsupported/empty states). Never request real user bills/credentials. If parsing only synthetic fixture profiles, reject real formats and label boundary outside product flow; do not pretend production provider support.
- duplicates, source conflict, refund unresolved/link choice, explicit include/exclude/review guards, atomic-confirm/save and recoverable error/retry semantics consistent with MODULE. Persisted data is prototype-only in-memory simulation; no claim of real Core Data/native atomicity.
- loading, empty, validation, cancellation, permission, success/error feedback, keyboard/focus and narrow/wide layouts.

Prototype may simulate native permissions/storage/errors with clear demo controls; no actual GPS collection or OS integrations required. Distinguish simulation from actual executed UI interactions in docs. Screen should feel like a usable ledger; keep audit/implementation jargon and debug scenario switches out of ordinary product controls (separate accessible demo panel if needed). Design source and tests/docs are separate files. Use proper labels, semantic buttons, focus handling, sufficient contrast/touch targets, no page horizontal overflow. Avoid unsafe innerHTML for file/merchant text; amounts use checked minor-unit parsing to match contract.
An interactive prototype is authorized design code; no production application implementation, deployment or design approval. Prefer focused native-inspired design over extra features/screens outside requirements. Do not use Sites hosting or publish a site; local self-contained design prototype suffices under UI contract.

## Version, verify, publish and Handoff
Write only own ui/ package remotely; user-facing local copies in /Users/leohu/Documents/Codex/2026-10-16/referenced-chatgpt-conversation-this-is-an/outputs/issue-5/ui/, scratch under work/. Share first usable prototype path promptly, then actual browser interaction tests and screenshot inspection/fixes. Use existing bundled Node Playwright + installed Chrome setup (SYSTEM/module verify-render.cjs recipes); no need to install new dependencies.
Publish proposed UI Profile/tokens first as an immutable commit so design package/profile refs can cite exact SHA; source prototype/spec/manifest must pin that actual profile revision. Branch mutations use live head + expected-head non-force updates; preserve other Master records. Then publish verified prototype/screenshots/interaction test script/logs/spec/UI↔API consistency matrix with exact refs and own receipt. Handoff in a later commit with dispatch/execution/runtime IDs, actual source@SHA, profile@SHA/statusPROPOSED, screenshots/tests and explicit approval/quality gaps. Use actual clock timestamps, no fabricated IDs, test results or Owner scores.
Owner UI-Q1–5 and material profile approval remain pending. Fresh independent DESIGN Review is mandatory after this package, not your own self-check. Do not claim DESIGN_READY or coding authorization. Stop on actual interface/baseline conflict and ask Master using durable evidence, not role simulation. No Figma required unless using real tools; editable versioned HTML design source is acceptable.
Required return: exact profile and source SHAs, immutable Handoff URL, local prototype entry + screenshot paths, actual interaction-test results and outstanding decisions. Keep research bounded and prioritize working artifact + meaningful tests.
