---
name: context-coordinator
description: Resolve minimal task-centered shared context, persist traceable agent messages, create checkpoints/handoffs and safely resume work across ChatGPT, Work or Codex sessions. Invoke within authorized PADF tasks; not a persistent agent service.
---

# Context Coordinator (PADF V0.2)

## Purpose
This is a reusable **procedural Skill**, not an agent daemon, tool API, messaging service or automatic dispatcher. It supports cross-session continuity and asynchronous communication among Master, Architect, UI Designer, Coder, QA and Reviewer by referencing authoritative GitHub/Linear records.

## Inputs
Project/repository, task/Linear issue URL or ID, original immutable Feature ID, task objective, agent role, existing Owner approval/Task Contract if executing a coding task, and any existing shared-context/checkpoint/handoff/message links.

## Operations (logical procedures, not preinstalled commands)
- initialize_context: construct or link [Shared Task Context](../../../contracts/shared-task-context.md) from live issue, GitHub versions and approved Task Contract.
- resolve_context: choose minimal role-specific source references, no blanket project document loading.
- record_message: validate [Agent Message Contract](../../../contracts/agent-message.md), post to the authorized Linear task or PR thread and verify permalink; if unavailable return NOT_PERSISTED/BLOCKED.
- read_messages: retrieve unresolved messages for current context_id and accountable role; compare source revisions; record acknowledgement when appropriate.
- create_checkpoint: write minimal [Context Checkpoint](../../../contracts/context-checkpoint.md) to a supported durable task location and record its URL.
- resume_context: verify live authorization, spec revision, Linear state, Git HEAD, dependencies and messages **before continuing**; flag STALE/BLOCKED on drift.
- prepare_handoff: create [Agent Handoff](../../../contracts/agent-handoff.md) with artifacts and SHA; record HANDOFF message; receiving role ACKs or requests refinement.
- reconcile_context: identify conflict and escalate through [Context Governance](../../../governance/context-governance.md); never silently override approved sources.
- compact_context: replace transcript-like history with source refs, decisions, evidence, open questions and next authorized action. Preserve audit trails.
- finalize_context: link final report, close resolved messages, propose source doc updates and confirm Owner acceptance gate without declaring it.

## Start
1. Read target project AGENTS.md and assigned Task Contract/issue.
2. Determine role and current authorization; if implementing, require explicit approved scope.
3. Resolve STC and verify canonical versions, Git base/head and Linear dependencies.
4. Pull relevant unresolved message threads and only affected Feature/architecture/UI/API sections.
5. If missing approvals, conflicting revisions or unavailable persistence, STOP and report exact blocker.

## During execution
- Use short typed messages for important cross-role questions/findings, with message_id and thread_id.
- Same-runtime discussion is allowed, but significant outcomes must be written back with permalink.
- Material scope/product/UX/architecture decisions require applicable Owner approval; post requests rather than applying silently.
- Do not create a second, inconsistent system of record or capture agent private reasoning.

## Handoff / resume
- Capture evidence and next authorized action in a checkpoint; then publish handoff if changing owner/role.
- On new session, re-fetch **live** sources; never assume resumed execution is safe simply because checkpoint says In Progress.
- Fresh-context Reviewer only consumes approved requirements, exact PR diff and verifiable evidence; do not preload Coder's reasoning or accept self-review.

## Output
Concise context_id, authoritative refs/revisions, observed task/head state, pending message refs, verified checkpoint/handoff permalinks, risk/blocker status and next responsible role. Distinguish CREATED/PERSISTED from DRAFT/NOT_PERSISTED.

## Safety
No background orchestration, automatic agent wake-up, auto dispatch, new storage server or A2A runtime in V0.2. No authorization escalation, deployment, destructive operations or merge by inference. Follow workflow/context-communication.md and governance/approval-policy.md.
