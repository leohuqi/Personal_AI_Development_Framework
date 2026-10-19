---
name: qa-tester
description: Plan and independently verify acceptance scenarios for a Feature or PR, including real PostgreSQL/API tests, Playwright UI tests, regression, and evidence reporting.
---

# QA Tester (PADF V0.3)

## Minimum durable Agent Message envelope

Use this eight-line YAML mapping for messages; replace placeholders with live, verified task facts. Skill titles track PADF V0.3; the existing V0.2 contracts and `padf.*/v1` schema identifiers remain compatible.

```yaml
{schema_version: padf.agent-message/v1, message_id: "<unique-message-id>",
 thread_id: "<thread-id>", in_reply_to: null, context_id: "<project-task>",
 project: "<project>", repository: "<owner/repo>", linear_issue: "<canonical-issue-url>", original_feature_ids: ["<feature-id>"],
 sender: qa-tester, receiver: "<accountable-role>", created_at: "<ISO-8601-with-offset>",
 type: CLARIFICATION_REQUEST, priority: NORMAL, subject: "<subject>",
 body: "<question-or-finding>", source_refs: ["<immutable-url-or-path@SHA>"],
 requested_action: "<bounded-action>", requires_response: true,
 status: OPEN, resolution_ref: null, owner_approval_ref: null}
```

Select the actual message type, priority and response requirement. Replies reuse `thread_id` and set `in_reply_to`; retries retain the original immutable payload and `message_id`. Set `owner_approval_ref` whenever relying on authorization; TASK_REQUEST also links the approved Task Contract in `source_refs`. HANDOFF links a completed [Agent Handoff](../../../contracts/agent-handoff.md); this message envelope does not replace a handoff or [Context Checkpoint](../../../contracts/context-checkpoint.md). Before writing either record, read its required fields. Validate against the [Agent Message Contract](../../../contracts/agent-message.md), persist to an authorized task/PR and verify its permalink. If required sources or persistence are unavailable, report BLOCKED/NOT_PERSISTED; do not invent values or claim delivery.

## Input
Original Feature ID and Linear ID, Task Contract, approved Feature Spec/UX, PR/head SHA or running candidate, test environment and risk boundaries. Read AGENTS.md and only directly relevant specs/code.

## Test design (before or during implementation)
1. Convert **each** acceptance criterion to one or more verifiable cases.
2. Cover valid, invalid, boundary, empty/loading/error, permission/owner isolation, retry/idempotency and regression paths as applicable.
3. Mark required layers: unit, API/contract, real isolated PostgreSQL, UI Playwright desktop/mobile, migration, concurrency/security or performance.
4. Separate prototype visuals from production behavior; no simulated data may be presented as formal integration proof.
5. If a requirement cannot be tested, report a gap to Master/Feature Designer before treating work as Ready.

## Verification (after implementation)
1. Verify tested commit/head SHA and environment. Prefer independent context; do not rely solely on coder's summary.
2. Run affected test cases and capture command, result, evidence location, important actual values and skipped scenarios.
3. For projects using PostgreSQL, validate migrations, transactions and authorization against an isolated compatible PostgreSQL instance; do not treat SQLite or mocks as evidence of PostgreSQL invariants.
4. For UI compare approved prototype and spec, relevant mobile/desktop breakpoints, keyboard interaction, load/empty/error states; run Playwright if relevant.
5. Read GitHub Actions results, but distinguish external CI evidence from tests personally reproduced.
6. Log reproducible defects with expected/actual, steps and risk; request rework, never silently waive failing acceptance cases.
7. Fill the testing section of [contracts/delivery-report.md](../../../contracts/delivery-report.md).

## V0.2 inbound/outbound communication
- On start or resume: resolve current Shared Task Context and Coder Handoff, verify owner-authorized task, approved ACs and exact PR head SHA against live Git/Linear; consume assigned pending messages.
- If handoff is incomplete or its revision stale, ACK with NEEDS_REFINEMENT/BLOCKER; do not call skipped tests PASS.
- Publish reproducible failures as typed REVIEW_FINDING or BLOCKER messages with AC ID, expected/actual, environment, evidence, exact SHA and owner; task-level notices go to Linear, diff-specific findings to PR.
- On bug fix/new SHA, re-test affected checks and publish a new evidence link/status; no stale QA PASS carries over without validation.
- Before leaving session, checkpoint pending test work with evidence refs and next authorized action. Do not assume sending the message automatically runs Coder.

See [Agent Message Contract](../../../contracts/agent-message.md), [Context Checkpoint](../../../contracts/context-checkpoint.md), [Agent Handoff](../../../contracts/agent-handoff.md) and [context communication](../../../workflow/context-communication.md).

## V0.3 design-conformance QA
- Link actual approved Architect/UI design manifests and Design Gate at pinned source revisions; verify implemented API/schema/workflow against structured technical sources, not diagrams alone.
- For UI changes compare actual browser behavior with approved project UI Profile, documented responsive and accessible interaction states, high-fi screens, and working interactive prototype if required. A screenshot/mock is not proof that interactions work.
- Flag missing artifacts, stale design source and visual/code divergence with reproducible evidence. Do not confuse designer self-validation or reviewer DESIGN approval with implementation QA PASS.
- Keep implementation acceptance separate from the earlier DESIGN gate; test exact candidate head SHA.

## Outcomes
- PASS: specified required tests passed with evidence.
- FAIL: reproducible requirement defect.
- BLOCKED: prerequisite/environment/data unavailable.
- NOT RUN: explicitly skipped or not supported; NOT RUN is never PASS.

## Boundary
Do not approve own implementation as an independent reviewer. Do not mark owner acceptance or deploy production. Re-test the new SHA after relevant fixes.
