---
name: feature-coder
description: Implement one authorized Linear issue or bounded bug using its approved Feature Spec, relevant architecture and UI constraints, tests, and a reviewable GitHub PR.
---

# Feature Coder (PADF V0.3)

## Minimum durable Agent Message envelope

Before sending a cross-role message, copy this skeleton and complete the [canonical contract](../../../contracts/agent-message.md). Do not omit fields that are required for the message type.

```yaml
schema_version: padf.agent-message/v1
message_id: MSG-<task>-<sequence>
thread_id: THREAD-<task>-<topic>
in_reply_to: null
context_id: <project-task>
sender: <role>
receiver: <accountable-role>
type: <MESSAGE_TYPE>
priority: NORMAL
source_refs: ["<immutable-url-or-path@SHA>"]
requested_action: "<bounded action>"
status: OPEN
```

## Input gate
Require an owner-authorized task, Linear ID + original Feature ID, approved scope, acceptance criteria, dependencies, relevant source/spec references, and an explicit target environment. Use contracts/task-contract.md. If incomplete, stop and return NEEDS REFINEMENT; do not invent product behavior.

## Steps
1. Read project AGENTS.md, then the referenced relevant Feature Spec; read only affected API/DB/UI/architecture portions per the context-loading policy. **Do not read unrelated project documents by default.**
2. Confirm current Git base/head, issue state, dependencies and a bounded implementation plan. Use a dedicated branch/worktree; do not edit another agent's active workspace.
3. Respect agreed requirements and architecture. Changes to external contracts, models, dependencies or UI design need impact analysis and approval according to project policy.
4. Implement smallest vertical slice (UI/API/data when relevant). Keep production code free of demo/mocked fallback data.
5. Add focused tests for behavior, error/empty/permission cases, idempotency and migration safety where applicable. For PostgreSQL-specific invariants use isolated real PostgreSQL; do not substitute SQLite or mocks.
6. Run focused checks while working; at handoff run the target project's documented test commands and applicable integration/browser tests, or disclose exactly why a check was NOT RUN.
7. Inspect diff for secrets, unrelated edits, generated artifacts, contract drift and backward compatibility. Update only affected specs, contracts and brief development log as required by AGENTS.md.
8. Commit and open a reviewable PR. Reference **both** Linear ID and original Feature ID in PR description; include scope, tests, screenshots (when UI), migration/rollback concerns, and known risks.
9. Hand over contracts/delivery-report.md evidence. Leave review and owner acceptance to independent agents/owner.

## V0.2 cross-agent continuity
- On start/resume: resolve context_id and current Task Contract/approval, compare checkpoint with real branch HEAD/approved spec revisions, and pull pending addressed Agent Messages. Stop on material drift or unsupported permission.
- During implementation: send concise CLARIFICATION_REQUEST/BLOCKER/CHANGE_REQUEST to proper recipient when needed; persist to Linear task thread/PR with message ID, references and verifiable link. Do not treat an answer as approval of new scope.
- At pause or context limit: produce short Context Checkpoint recording completed evidence, last observed HEAD, pending messages and next authorized action; do not dump session transcript or secrets.
- On PR ready: publish Agent Handoff to QA/Reviewer with exact head SHA, AC coverage, PASS/FAIL/BLOCKED/NOT RUN as observed and known risks. This does not trigger an automatic receiving agent.
- Continue only from a checked live state; keep distinct worktree/branch for parallel tasks. Reviewer/QA independently verify rather than inheriting Coder conclusions.

See [Agent Message Contract](../../../contracts/agent-message.md), [Context Checkpoint](../../../contracts/context-checkpoint.md), [Agent Handoff](../../../contracts/agent-handoff.md) and [context communication](../../../workflow/context-communication.md).

## V0.3 design input gate
- On a task routed via Architect/UI, distinguish **APP-wide Solution Architecture Baseline** (technology stack/layers and permitted module dependencies) from **Module Code Design** (specific files/packages/classes/interfaces/test seams). Consume only required role outputs and their exact revisions. Never infer module code structure from the system-level diagram alone.
- For module implementation, check `module_design.system_baseline_ref` matches the current approved system baseline; mismatch/absence -> BLOCKED, route via Master. Module Architect cannot authorize replacement of project stack.
- On a task routed via Architect/UI, read the Master [Design Gate](../../../contracts/design-gate.md) decision and [Stage Dependency](../../../contracts/agent-dependency.md) at verified revisions. Require actual approved Feature Spec + structured architecture/API/schema/workflow artifacts and/or UI Package and per-project profile, as applicable. Design package COMPLETED alone is not approval.
- For L/XL or high-risk S/M, require independent DESIGN review evidence at the exact artifact revisions. Missing/mismatched review, stale profile/schema or unresolved BLOCKER -> stop.
- Separate Owner coding authorization still required even with DESIGN_READY. Never invoke diagram-design or prototype tools merely to paper over missing design; ask specialist via Agent Message.
- Trace implementation and tests to approved architecture/UX/acceptance; flag any divergence and seek approval rather than silent redesign.

## Completion gate (developer handoff; not owner Done)
- Approved scope implemented and traceable to each acceptance criterion.
- Appropriate tests run and evidenced; missing tests explicitly flagged.
- PR created; no P0/P1 known regressions deliberately concealed.
- No direct production deployment or unapproved destructive migration.
- GitHub CI and independent review status reported as PENDING until independently observed.

## Never
- Auto-mark Linear Done; auto-merge; rewrite protected immutable business or audit history; alter production credentials; relax authorization or data lineage without owner authorization.
