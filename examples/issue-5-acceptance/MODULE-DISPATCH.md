# MODULE — durable Master Dispatch / bounded Task Contract
schema_version: padf.agent-dispatch/v1
dispatch_id: I5-MODULE-001
context_id: PADF-ISSUE-5-EXPENSE-ACCEPTANCE
original_feature_id: EXPENSE-ACCEPTANCE-005
target_role: module-architect
target_skill_ref: .agents/skills/module-architect/SKILL.md@f1b6a6e4a90d547127bd95bceaa12880a7c39855
target_skill_blob_sha: a245054afec4a4c5ffb6b283d32e32a52c46058e
task_class: L
architecture_scope: both
execution_mode: RUNTIME_DISPATCH
initiated_by: MASTER_RUNTIME_TOOL
repository: leohuqi/Personal_AI_Development_Framework
delivery_branch: acceptance/issue-5-real-orchestration
delivery_pr: https://github.com/leohuqi/Personal_AI_Development_Framework/pull/6
depends_on_dispatch_ids: [I5-SYSTEM-002]
prior_handoff_ref: https://github.com/leohuqi/Personal_AI_Development_Framework/blob/d27e66ef6c086f4d95271a198ddfacf658499d52/examples/issue-5-acceptance/system/HANDOFF-V2.md
prior_reconciliation_ref: https://github.com/leohuqi/Personal_AI_Development_Framework/blob/04b741ba7547cf2cbe6a318d09688ef67e7d88cd/examples/issue-5-acceptance/MASTER-SYSTEM-RECONCILIATION-V2.md
system_baseline_ref: examples/issue-5-acceptance/system/SYSTEM-BASELINE.md@f4dbf0d3fac707db1b57252c529618c38d26f0bc
system_baseline_status: APPROVED
system_baseline_owner_approval_ref: https://github.com/leohuqi/Personal_AI_Development_Framework/blob/05ba2117e2fbb5ac924913accb76b763a2fc268c/examples/issue-5-acceptance/OWNER-SYSTEM-APPROVAL.md
diagram_source_sha: 123aa014962289feccf527f8e063a19299c1e975
Master routing rationale: whole-app baseline is now actually approved and SYSTEM visual evidence received/reconciled. Need implementable contracts for ExpenseRecord workflow before UI. Module role must stay within approved stack, not repeat system selection.

## Read and authorize
Initial specialist input is only this URL. Read live Issue 5, pinned AGENTS, own Skill, affected module/dispatch/handoff/diagram contracts; exact baseline/model and Owner approval above. No other agent transcript. Prior pilot Issue 4 is not source or approved design.
Owner's original instruction authorizes Issue 5 bounded synthetic design pilot and PR delivery; actual later approval fixes SYSTEM proposal and default diagram style. New actual module work is authorized within that approved baseline; production implementation/coding, merge and deployment are excluded.

## Bounded module scope
Design the ExpenseRecord pipeline: manual entry + user-exported bill preview/review/atomic commit, local category prefill/user override, location provenance + optional consented current sample, duplicates/overlap/idempotency/refunds and local persistence. Backup/migration seams must align approved SYSTEM policies; no need to implement full backup subsystem or unrelated features.
Fixed: iPhone native/local offline, Swift 6.2 / SwiftUI / Core Data, no backend/login/remote AI. Keep SYSTEM source ref EXACTLY as above. If changing material policy would be necessary, record CHANGE_REQUEST and stop instead of approving it yourself.

## Required own deliverables — examples/issue-5-acceptance/module/
Concrete package/file/class/port map, typed internal command/query/result contracts (Swift signatures or precise typed pseudocode), Core Data logical entity/attribute/relationship/uniqueness/index/version model, transaction and concurrency rules, state machine/error/cancel/retry/restore seams, synthetic export profile/version/detection rules, stable duplicate/refund identity and privacy-preserving provenance. No arbitrary REST/OpenAPI/server DDL: local typed API and Core Data model satisfy API/DB scope; explicitly explain N/A external HTTP.
Include exact algorithms for no provider ID/overlapping exports/conflicting source IDs/user overrides, linked/partial/multiple/unresolved refunds, currencies/time zone/provenance, GPS denied/unavailable behavior. Preserve money/integer and source ownership invariants. Resolve requirements conservatively without silently changing approved material decisions. Real provider export compatibility is not proven by synthetic fixtures; distinguish proposed adapter profiles from tested production formats.
Diagrams: module component/port, import sequence/workflow, data model and relevant state/transaction diagrams, matching authoritative contracts. Actually use verified installed diagram-design@11b08eade8049c441ed3df1895e3b527c26c0fbe; default style already explicitly approved project-wide in owner record, do not ask again. Existing project-local DEFAULT-STYLE.md in SYSTEM package can be reused for diagrams, not misrepresented as an app UI Profile.
Test plan: units, integration/atomicity/retry, overlap/source conflict/refund ordering, GPS consent, untrusted files/formula/path/encoding/quota, migration and UI-facing state/error seams. Write source model/contract validation if useful; no full expense app implementation.
Actually render and inspect required diagrams, record honest tools/Skill pin/render/test statuses and verify source↔diagram alignment. Need reproducible small verification scripts in package, not only scratch hashes. Browser recipe: bundled Node Playwright is available; installed Chrome works, default bundled Chromium absent. Use existing actual setup/evidence via system/README if helpful. Avoid spending time installing dependencies or researching new stacks.
Provide local browsable module viewer/docs and actual PNGs under workspace outputs/issue-5/module/ (absolute workspace /Users/leohu/Documents/Codex/2026-10-16/referenced-chatgpt-conversation-this-is-an). Scratch under work/. Diagram labels should be readable; standalone HTML/SVG or a simple viewer is sufficient, no new visualization platform.

## Evidence and handoff
Record own execution receipt with exact clock observations, canonical runtime task, immutable Dispatch URL read and observed own Skill SHA. Publish own artifacts on assigned branch through GitHub connector (prefer atomic tree+commit+expected-head non-force ref update), then immutable HANDOFF.md in a later commit. Other roles may append Master records, so always read live branch head before updating; never force overwrite.
Handoff must cite exact baseline/approval, dispatch/execution IDs, source manifest@SHA, render/test logs and open decisions. Return source SHA, Handoff URL and local output entry path promptly. Stop after module. No UI package, Owner scoring, self-review claimed independent, coding/merge/production/PQA changes.
Owner MA-Q1–5 will be scored separately. Fresh independent DESIGN review is mandatory later; COMPLETED means own delivery, not accepted or DESIGN_READY.
