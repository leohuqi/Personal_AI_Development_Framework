# Context Governance — PADF V0.2

## Principles
1. **Task-centered, not conversation-centered.** Every shared state points to project, Linear issue, original immutable Feature ID and approved Task Contract.
2. **Source authority over cached context.** GitHub approved docs/ADR/code are technical truth; Linear is current task/priority/dependency state; owner approval record governs authorization. A checkpoint/message/STC is an index or observation, not higher authority.
3. **Minimal and versioned.** Read only affected sections and record immutable revisions, relevant head/base SHA, observation time and provenance. No wholesale chat/PRD copying.
4. **Communication != permission.** Agent-to-Agent messages can request, clarify and report; they cannot authorize new scope, change approved product contracts, merge, deploy or mark owner acceptance.
5. **Separation of duties.** Reviewer tests actual base-to-head diff with independent reasoning; QA records evidence; Master coordinates, Owner accepts.
6. **Recoverability over transcripts.** Handoffs/checkpoints contain references, progress, next actions and blockers, never hidden chain of thought or complete raw conversations.

## Ownership / edit rights
- Owner: final product/UX/architecture exceptions, coding authorization, acceptance and dangerous production actions as specified in approval-policy.md.
- Master: assembles/reconciles STC, routes questions, triages conflicts and proposes decisions; cannot invent Owner approval.
- Architect/UI Designer/Product Analyst: propose relevant contracts and record approved revisions only under the existing design governance.
- Coder: implement authorized scope, publish artifact refs and handoff, no owner Done, no unauthorized deployments.
- QA/Reviewer: independent findings and evidence; cannot silently edit product baseline or declare owner acceptance.

## Source precedence and conflicts
- Owner-approved decision/exception applicable to the exact scope and revision governs allowed decisions.
- Approved Feature Spec/ADR/API/UI source revision governs behavior/design; code at observed Git SHA governs *what exists*, not what was approved.
- Linear live issue reflects execution state. Snapshot/Message claims are lowest priority for correctness until confirmed.
- If two **approved** sources conflict, do not choose arbitrarily; emit BLOCKER/CHANGE_REQUEST and request Master/Owner resolution. Preserve old versions for audit.
- If a checkpoint is stale, compare revisions, mark stale and recompute STC from live systems; never overwrite another agent's work.

## Message durability and consistency
- Every persisted agent message has id/context/thread/type/status/source refs, identifiable sender and receiver.
- Reply references in_reply_to, not a free-floating comment. Resolve explicitly with evidence and reason.
- Store task messages as Linear issue comments and PR-specific review findings at PR; include links between records.
- Record canonical URLs after successful writes; a generated text string without verified write is not persisted.
- Retry with stable message_id; check existing records before re-posting. Ensure status changes are traceable rather than editing away past exchanges.
- One writer/branch owner at a time for conflicting paths; parallel work requires agreed boundaries, separate worktrees and integration review. No destructive force push.

## Staleness and lifecycle
- Start/resume: verify authorization, live Linear status and dependencies, approved spec revision, Git base/head, outstanding messages.
- Handoff: verify artifact exists and SHA matches, request receiver ACK.
- Fix/new SHA: affected test/review approvals must be refreshed.
- End: promote substantive approved decisions into canonical docs; archive or link final Delivery Report, close resolved messages and preserve evidence.
- No promised automatic wake-up: new sessions actively pull pending messages. Human-triggered workflows remain default.

## Security and privacy
- Never persist secrets, credentials, API keys, access tokens, private customer/account records, user conversation transcript or chain-of-thought.
- Respect repository/issue ACLs and least privilege. Do not send private docs to an agent/environment without appropriate access.
- Sanitize evidence and use stable permalinks; prefer references over unbounded excerpts.
- Do not change production configurations, credentials, destructive migrations or deployment without separate authorization.

## Acceptance boundaries
The following are **distinct evidence states**: implementation completed; CI green; QA PASS; independent review approved; PR merged; Owner accepted; deployed. Do not infer one from another. A missing artifact/test is NOT RUN/UNKNOWN, not PASS. See approval-policy.md and WORKFLOW.md.

## V0.3 design source-of-truth additions
- Database: authoritative schema/DDL/migration and approved model at exact revision; HTML/SVG ER/schema drawing is a traceable visualization **not** the authoritative schema.
- API: exact approved OpenAPI/API contract; sequence/integration diagram must match endpoint and failure semantics.
- UI: each product owns its own approved [Project UI Profile](../contracts/project-ui-profile.md); Feature UI designs pin profile/real component versions. Site-specific exceptions need written approval, not a global PADF style override.
- Diagram-design is third-party external skill, not bundled; lock version and verify installation/use before saying diagram was generated.
- Design Gate is separate from specialist COMPLETED and Owner coding authorization; exact upstream revisions invalidate affected downstream design/review gates.
