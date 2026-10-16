# PADF repository rules

- PADF is a generic Skills/framework repository, not an application runtime.
- Keep project-specific PQA rules in `examples/pqa/` or its own project; do not encode PQA-only test commands in generic Skills.
- Never load unrelated project documents by default. Read the assigned issue/Feature Spec and only affected architecture/API/UI/contracts.
- Preserve explicit role inputs, outputs, handoff contracts, review independence, acceptance and approval boundaries.
- Owner approves significant product/UX/architecture changes, bounded coding dispatch, production operations, destructive actions and final acceptance.
- CI green, PR merged, independent review passed, Owner accepted and production deployed are separate facts.
- Do not introduce Linear Loops, self-hosted orchestration or automatic issue dispatch without new authorization.
- Do not modify, close or merge PQA Draft PR #7 during PADF review.

## CACF V0.2 — shared context and communication
- Use the assigned Linear task and original immutable Feature ID to derive stable context_id; keep both IDs distinct.
- Resolve minimal task context using contracts/shared-task-context.md and governance/context-loading.md. GitHub code/approved specs/ADRs, Linear live task state and recorded Owner approvals outrank cached agent notes.
- For important cross-role exchanges use contracts/agent-message.md, durable Linear or GitHub PR discussions, unique message/thread IDs and verified permalinks; message persistence never implies automatic wake-up or authorization.
- Before session end or role transfer, create a concise referenced checkpoint/handoff when possible. On resume verify live issue/approvals, Git head/spec revisions and pending messages; stop on material drift.
- A Reviewer must use approved requirements and the exact diff with independent reasoning; never import Coder conclusions as review.
- No new runtime, task scheduler, message broker, DB, automatic dispatch, A2A server, autonomous merge or production action is enabled by V0.2.
- PQA Draft PR #7 must remain unchanged during PADF review.

## V0.3 specialized design rules (candidate)
- Master routes only relevant Architect/UI Designer Skills and documents S/M/L/XL risk and skipped roles; must not auto-run agents.
- Whole-app/new-platform tech stack, APP-wide code structure or cross-system boundaries require the **Solution Architect** and a versioned Solution Architecture Baseline. An existing approved system is reused, not redesigned for each feature.
- Module-specific API/schema/workflow/class/package design inside the approved baseline uses the **Module Architect**, with matching baseline SHA and technical/visual contracts. Master chooses system/module/both/none; no automatic double invocation.
- Both roles provide structured contracts **and justified diagrams** using pinned diagram-design where required; renderer absence is BLOCKED/NOT RUN, never fabricated.
- For UI changes the UI Designer loads the **project's own approved UI Profile** and cites its revision; concept/high-fi/interactive levels are chosen by complexity. Static images are not interactive source.
- Design Handoff uses V0.2 contract; Master owns readiness/approval routing, Independent Reviewer audits DESIGN mode for L/XL and risk-triggered S/M, Owner approves material design changes and coding.
- V0.3 is under review on a feature branch; immutable PADF v0.2.0 release remains unchanged. Never modify PQA PR #7 as a side effect.
