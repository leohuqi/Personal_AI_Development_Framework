# Agent Message Contract — PADF V0.2

Purpose: **durable, traceable, asynchronous communication** between agent roles, including agents running in different ChatGPT, Work or Codex sessions. A message is not an executable task and does not wake or dispatch an agent by itself.

## Canonical envelope
Required fields:
- schema_version: padf.agent-message/v1
- message_id: unique immutable id, e.g. MSG-<task-id>-0001; keep the same ID for every retry of the same logical message; use a new ID only for a new logical message
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
- Status belongs to each individual message, not to the whole thread. A new RESPONSE has a new message_id, starts OPEN and points to the request via in_reply_to; publishing it may move the **request** to RESPONDED. RESPONSE is a message type; RESPONDED means that this particular message has received an answer, not that its recipient has consumed it.
- Normal request path: OPEN -> ACKNOWLEDGED -> RESPONDED -> RESOLVED -> CLOSED. An immediate correlated response may move OPEN directly to RESPONDED. Only the assigned receiver acknowledges or responds; sender or Master records resolution with evidence and closes it. A reply alone does not resolve a request.
- For requires_response=false events (including answers), receiver records actual retrieval as ACKNOWLEDGED; sender or Master may then record RESOLVED -> CLOSED with the receipt/action evidence, without inventing an additional response. In a bounded test, explicit authorization may let the receiver record this disposition on behalf of the sender/Master.
- OPEN/ACKNOWLEDGED may become BLOCKED or ESCALATED. Sender or Master records the reason, accountable role and prior status; return to that prior status only after linking the unblock/decision evidence, or explicitly resolve with a cancellation/decision record. No silent reset or acceptance is implied.
- Pending retrieval/reconciliation includes addressed OPEN, ACKNOWLEDGED, RESPONDED, BLOCKED and ESCALATED messages; never filter solely on OPEN. A RESPONDED reply in an older record remains pending until explicit consumption/resolution evidence is present. RESOLVED/CLOSED are excluded only when their evidence has been verified.
- Keep status changes append-only or revisioned, referencing message_id and prior state. A lifecycle transition does not create a new logical message or overwrite its immutable payload. Same-ID retries must have the same immutable envelope/body/source refs; a different payload is an ID conflict and must be BLOCKED. Optional delivery-attempt IDs are separate from message_id. Inspect existing records after uncertain writes before retrying.
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
