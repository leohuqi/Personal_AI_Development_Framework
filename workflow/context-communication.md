# Context & Agent Communication Workflow — PADF V0.2 (CACF)

**Specification/Skill integration, not a service, task queue, autonomous agent loop or A2A server.** Agents may communicate through durable Linear/GitHub records without sharing a chat history; recipients must explicitly start/poll through an authorized runtime. Persisted messages do not imply auto-wake, guaranteed delivery or automatic task execution.

## Model and contracts
- [Shared Task Context](../contracts/shared-task-context.md) — task-centered references, identities, revisions and coordination.
- [Agent Message](../contracts/agent-message.md) — asynchronous typed request/response/event with lifecycle and correlation.
- [Context Checkpoint](../contracts/context-checkpoint.md) — session resume with live-source reconciliation.
- [Agent Handoff](../contracts/agent-handoff.md) — bounded cross-role transfer with artifacts and evidence.
- [Context Governance](../governance/context-governance.md) — source hierarchy, authority, concurrency, protection and conflict handling.
- [Context Coordinator Skill](../.agents/skills/context-coordinator/SKILL.md) — shared procedures, invoked by Master/role agent as needed; **not an always-on agent**.

## Normal flow (integrated with WORKFLOW.md)
1. **Context readiness**: Master resolves AGENTS.md, issue/Feature IDs, approved specification and source SHA; creates or reconstructs minimal STC, confirms DoR and owner authorization for development.
2. **Dispatch**: Authorized Task Contract links STC, relevant source sections, pending message threads and next role. Receiver resolves current issue/HEAD before acting.
3. **Collaboration**: Agent sends CLARIFICATION_REQUEST, BLOCKER, ARTIFACT_READY, REVIEW_FINDING or CHANGE_REQUEST to a named role; persists message in task Linear comment or exact PR discussion as appropriate and verifies the link. Direct same-runtime exchanges that affect decisions must also be recorded durably.
4. **Decision**: Receiver responds with source refs. For material UX/business/architecture changes, escalate to Master/Owner. Only approved changes enter authoritative Feature Spec/ADR/API/UI baseline; do not treat a message as an approval.
5. **Checkpoint/handoff**: At session boundaries or role changes, capture small referenced snapshot with observed SHA, completed evidence, remaining work and blockers. Publish HANDOFF message referencing it. Receiver ACKs or blocks after live-source verification.
6. **QA and review**: Test and independent review the exact PR head, not an implementer's summary. Any fix/new SHA invalidates stale review/test claims where affected; retest/re-review as appropriate.
7. **Owner gate and finalize**: Master reconciles evidence and asks Owner to accept. Update Linear Done only with applicable approval; archive completed task context via links, close resolved message threads and track residual work in issues. PR merge and production deployment remain separate gates.

## Role communication paths
- Product Analyst/UI Designer <-> Architect: design contracts and constraints. Any approval-affecting proposal goes to Master/Owner.
- Coder <-> Architect/UI: clarification, already-approved design handoff, BLOCKER.
- QA Tester -> Coder: reproducible defect/evidence; follow up on fixed SHA.
- Independent Reviewer -> Coder: anchored PR finding; reviewer remains independent and rechecks changed SHA.
- Any role -> Master: contradiction, blocked dependency, ambiguous authorization or missing accountable recipient.
- Master -> Owner: significant changes, acceptance, production/destructive operations.

The same protocol works in sequential sessions; simultaneous direct agent connections are **optional** and not provided by this version.

## Where messages/checkpoints live
- Linear issue comments are preferred for task-level messages, state and dependency tracking; record message_id/thread_id/context_id in comment.
- GitHub PR review/comments are preferred for code review and exact SHA findings. Link the corresponding Linear task and message identifier.
- GitHub versioned docs/ADRs remain canonical for approved design, code and acceptance definitions.
- Checkpoint/handoff are durable task/PR attachments or links where the enabled connector supports them; never assume arbitrary filesystem files automatically synchronize.
- If a connector/permission fails, return BLOCKED or NOT PERSISTED and the missing action; a locally generated message without durable permalink is not a completed delivery.
- Do not create a new storage backend or duplicate the entire PRD in STC.

## Minimal read profiles
- minimal: AGENTS, Task Contract, STC references, affected Feature Spec/contracts, pending messages; Coder/QA.
- design: minimal + affected architecture/API/UI/ADR sections; Architect/UI.
- review: AGENTS, approved task/spec/ACs, actual PR diff/linked evidence; no implicit inheritance of Coder's analysis.

## Staleness, idempotency, concurrency
- Source refs carry immutable SHA where possible, plus observed_at and provenance.
- On resume/handoff compare live Git HEAD, Linear issue state/owner, dependencies, pending messages and approved spec revision.
- One accountable writer for any shared mutable document/PR branch; separate worktrees for parallel Coders; use PR/commit review and safe version preconditions, never last-write-wins.
- Message IDs are stable; on retry search before publishing again. Duplicate delivery should not duplicate authorizations or changes.
- Stop and escalate on unapproved change, contradictory specs, source drift, lost ownership or unsafe action.

## Operational boundary
PADF V0.2 adds contracts and instructions; it does **not** register persistent agents, configure Linear/Codex/GitHub integration, send live notifications, auto-dispatch tasks, merge PRs or deploy. Every new coding task remains explicitly owner-authorized.

## Practical test (manual, not an automated runtime test)
1. Start authorized task with STC and Task Contract.
2. Coder posts a tagged CLARIFICATION_REQUEST in the Linear task.
3. In a fresh Architect session, read pending messages, respond with link to approved spec or escalate; persist response.
4. Coder resumes from checkpoint, compares HEAD/spec versions, consumes answer.
5. Coder issues HANDOFF to QA with exact PR head; QA independently reports PASS/FAIL/BLOCKED/NOT RUN.
6. Reviewer uses fresh context, not the Coder transcript; Master reconciles evidence and asks Owner.
