# Agent Message Contract — PADF V0.2

Purpose: **durable, traceable, asynchronous communication** between agent roles, including agents running in different ChatGPT, Work or Codex sessions. A message is not an executable task and does not wake or dispatch an agent by itself.

## Canonical envelope
Required fields:
- schema_version: padf.agent-message/v1
- message_id: unique immutable id, e.g. MSG-<task-id>-0001; do not reuse after retries
- thread_id / in_reply_to: correlate multi-message conversations; null for first message
- context_id; project/repository; Linear issue URL/ID; original Feature ID(s)
- sender role; receiver role or named accountable role; created_at (ISO-8601 with offset)
- type; priority NORMAL/HIGH/BLOCKING; subject; concise actionable body
- source_refs: document section/revision, file path, issue/PR link, base/head SHA where applicable
- requested_action; requires_response; response_due only if actually agreed (no invented deadlines)
- status; resolution_ref / evidence_ref when resolved
- owner_approval_ref if requesting or relying upon a bounded authorization

No credentials, tokens, private user datasets, raw customer/account records or full chat transcripts in message bodies.

## Message types
- TASK_REQUEST — convey an **already authorized**, bounded assignment; include Task Contract and approval ref.
- CLARIFICATION_REQUEST — request interpretation; no scope change implied.
- RESPONSE — answer a thread; cite references and identify if proposed vs approved.
- ARTIFACT_READY — hand off an approved design, code, API contract or test artifact with immutable revision.
- BLOCKER — signal a dependency or execution stop; name the action needed and owner.
- CHANGE_REQUEST — propose scope/architecture/UI/contract changes; only Owner or applicable authority may approve.
- REVIEW_FINDING — structured QA/review defect or security issue with severity, location, repro/evidence and exact SHA.
- HANDOFF — point to the Agent Handoff Contract and checkpoint/artifacts.

Acknowledgement is a **status transition** (ACKNOWLEDGED), not a new authorization message. Replies must reference in_reply_to and thread_id.

## Lifecycle and delivery semantics
- OPEN -> ACKNOWLEDGED -> RESPONDED -> RESOLVED -> CLOSED.
- OPEN/ACKNOWLEDGED can become ESCALATED or BLOCKED. On resolution, close with the decision/evidence link.
- Only the assigned receiver/accountable role acknowledges/responds; sender or Master reconciles resolution. Do not mark RESOLVED merely because a reply exists.
- Message persistence is at-least-once in concept, **not automatic**: writers must verify the created Linear comment/PR comment link. On retry, inspect message_id to avoid duplicate side effects.
- Receiving agents **pull pending messages on start, resume and before handoff**. No guarantee of real-time push, notification delivery or autonomous wake-up.
- Default placement: task communication in Linear issue comments; code review and exact-diff discussion in GitHub PR comments/reviews. Link across systems by context_id, message_id, thread_id and PR SHA. If a connector does not support the placement, keep a durable equivalent link and report the limitation.
- Never approve architecture, mark Done, dispatch coding, merge, deploy, or bypass quality gates on the basis of a message alone.
- High-impact contradiction/expired blocking response -> Master; significant product/UX/architecture change -> Owner approval.

## Example — proposed API clarification (illustrative only)

    schema_version: padf.agent-message/v1
    message_id: MSG-PQA-LEO-134-0001
    thread_id: THREAD-PQA-LEO-134-01
    in_reply_to: null
    context_id: PQA-LEO-134
    project: PQA
    repository: leohuqi/Personal_Quant_Analyst
    linear_issue: "<canonical-linear-link>"
    original_feature_ids: ["<original-id>"]
    sender: feature-coder
    receiver: solution-architect
    type: CLARIFICATION_REQUEST
    priority: NORMAL
    subject: "Batch Preview partial-failure response"
    body: "The approved API contract does not specify per-strategy error isolation."
    requested_action: "Clarify result status and error isolation without expanding scope."
    source_refs:
      - "docs/api-spec.md#<section>@<approved-sha>"
    requires_response: true
    status: OPEN
    resolution_ref: null
    created_at: "2026-10-13T10:00:00+08:00"

Replies identify the same thread_id, set in_reply_to to the original message_id and link the approved API revision if a formal contract change was necessary.
