# AI-SDF V0.2 Core Development Workflow

**Specification, not an engine.** This workflow is human-initiated with hosted GitHub Actions and separately configured Codex review; it does not run continuously.

## Actors
**Owner** makes product, UX, architecture, acceptance and production decisions. **Master** refines, plans, verifies readiness, delegates approved bounded tasks and reconciles QA/review evidence. **Coder** implements and tests. **QA Tester** independently verifies cases. **Independent Reviewer** checks the exact PR diff and risk. **Linear** tracks project/Cycle/issues, **GitHub** stores authoritative code/specs/PR/CI.

## State machine
| Linear state | Meaning for new work | Gate |
| --- | --- | --- |
| Backlog | Not yet ready / deferred / blocked | Feature scope and blockers documented |
| Todo | Ready | Definition of Ready + owner authorization |
| In Progress | Coding | Authorized Task Contract, dedicated branch |
| In Review | CI, QA, independent review, owner acceptance pending | PR at exact SHA, test evidence, findings |
| Done | Accepted | Owner decision and Delivery Report |
| Canceled / Duplicate | Not proceeding | Reason and links |

Imported historical Done may signify implementation archival only. Preserve the consuming project's legacy status semantics.

## Feature Loop — explicitly started
1. Owner/Master classify S bug, M feature, L cross-module or XL product. Reconcile PRD/UI/Architecture/Feature Spec with Linear ID and original Feature ID.
2. **Definition of Ready:** unambiguous scope and exclusions, approved Feature Spec/source SHA, resolved dependencies, design decisions/UX baseline, testable acceptance criteria, required tests and explicit approval.
3. Master resolves [Shared Task Context](../contracts/shared-task-context.md) and pending messages, then creates [Task Contract](../contracts/task-contract.md) with context refs; owner starts Codex on the approved bounded task. Linear Free **does not automatically dispatch**.
4. Coder verifies current source SHA and messages, implements the minimal vertical slice, unit tests and relevant docs, opens GitHub PR including both IDs, and issues a verifiable Agent Handoff to QA/review; no production deployment.
5. GitHub Actions runs project CI on PR; QA verifies acceptance with PASS/FAIL/BLOCKED/NOT RUN; Reviewer separately examines exact base-to-head diff, risk and evidence.
6. Failing QA/CI/review returns to bounded rework, then retest and re-review new SHA; P0/P1 block merge/acceptance, P2 needs fix or explicit Owner-approved conditions, P3 tracked.
7. Master reconciles agent messages, checkpoints, handoffs, evidence and remaining risks. Only applicable Owner approval permits newly developed Issue Done. PR merge ≠ deployment or business acceptance.

## Iteration Loop — owner initiated
Select small vertical, independently usable MVP slices; plan current 1–2 Cycles in detail, further Roadmap coarsely. Track dependencies, UI/API/data/test work and integration criteria. At Cycle end review integrated behavior, test coverage, remaining technical debt and feedback-based Bug/CR. Default separate integration review every **3–5 merged feature PRs (no later than fifth)** and at significant milestones / pre-release; project policy may be stricter.

## Failure and security gates
Stop on ambiguous specs, missing prerequisites, unapproved architecture changes or blocked dependencies; never invent product behavior. A green CI or self-review does not constitute independent approval. Reviewer must use fresh context for significant changes; re-review altered head. Missing evidence is NOT RUN, not PASS. Destructive migrations, production deployments, credential changes and deletion always require separate explicit authorization. No unbounded automatic retry or hidden background monitoring.

## V0.2 Context & Agent Communication gates
This section is binding in addition to all existing DoR, Owner authorization, review and safety gates. See [CACF workflow](context-communication.md), [context governance](../governance/context-governance.md) and [Context Coordinator Skill](../.agents/skills/context-coordinator/SKILL.md).

1. **Context Readiness**: Master validates approved Feature Spec/revision, Task Contract, code baseline, original Feature ID, Linear issue/dependencies, authorized scope and unresolved critical message threads. Do not dispatch until DoR/approval are satisfied.
2. **Agent start/dispatch**: Every agent loads only role-relevant source sections and pending messages from the task's Shared Task Context. Verify live revisions/status; a checkpoint alone is not authorization.
3. **Collaboration**: Persist cross-role decisions, blockers and actionable questions in durable Linear issue comments or PR reviews using the [Agent Message](../contracts/agent-message.md) envelope. Direct messages within one runtime are optional and not inherently durable.
4. **Checkpoint/handoff**: At planned session/role boundaries publish a [Checkpoint](../contracts/context-checkpoint.md) or [Agent Handoff](../contracts/agent-handoff.md) with exact revision, evidence, open messages, next role and stop conditions. Verify recipient ACK after actual retrieval; message creation does not start the recipient.
5. **Resume reconciliation**: New session reads live Git HEAD, relevant approved specs/ADRs, Linear state/dependencies and outstanding messages. On version drift/authorization gaps, stop and escalate; do not clobber other agents' work.
6. **Review independence**: QA and Reviewer verify against exact artifact SHA. Never treat Coder transcript/self-review as independent evidence. A new head requires affected revalidation.
7. **Finalize**: Master links final Delivery Report, ensures approved decisions are reflected in canonical docs, closes resolved messages, tracks deferred work and requests Owner acceptance.

V0.2 does **not** implement a long-running orchestrator, automatic notifications, background agents, self-triggered tasks, Redis, a new database, or an A2A server. Human/authorized runtime invocation remains required.
