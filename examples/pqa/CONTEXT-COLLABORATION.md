# PQA CACF V0.2 — Cross-agent continuity walkthrough

**Illustrative playbook only.** This file does not assert that any PQA task, message, PR or test has occurred. It does not authorize development or change PQA Draft PR #7.

## Scenario
A PQA Stock Strategy Analysis enhancement needs API contract clarification while a Coder works in one session and Architect/QA operate in other sessions.

1. Master identifies the **actual** Linear issue and immutable Feature ID, loads PQA AGENTS.md, task scope and relevant strategy/stock-detail docs at approved revisions. Existing Issue and Feature ID must be verified, never invented from this example.
2. Master constructs Shared Task Context using schema padf.shared-task-context/v1 and links source specs, approval reference and Task Contract. The Linear issue is execution-state authority; GitHub approved documents are technical authority.
3. After owner-authorized dispatch, Coder checks branch HEAD and pending messages. A missing Batch Preview partial-failure contract becomes CLARIFICATION_REQUEST (padf.agent-message/v1) in the task thread.
4. In a separate Architect session, the recipient loads the message, checks source revisions, responds in the same thread. A material API-contract change is proposed to Master/Owner; only approved change becomes a versioned GitHub API spec. This does not automatically wake Coder.
5. Before pausing, Coder persists padf.context-checkpoint/v1 with current observed HEAD, completed evidence, pending message ids and next allowed action.
6. In a new Work/Codex session, Coder follows resume algorithm: compare actual HEAD, latest approved spec and Linear state against checkpoint; reconcile the answer before coding.
7. Coder publishes PR and padf.agent-handoff/v1 to QA with the **exact head SHA**. QA tests acceptance criteria independently and reports PASS/FAIL/BLOCKED/NOT RUN; Reviewer reads actual PR diff with fresh context.
8. Master reconciles results. Only applicable owner acceptance permits Linear Done; CI green/PR merged do not imply production deployment.

## Source selection
- Start: PQA AGENTS.md, real issue/Task Contract and relevant docs/features/*.
- For API changes: affected docs/api-spec.md section and technical call sites.
- For Research Universe scope: affected strategy/research-universe specs and approved ADR.
- For independent review: approved contract/spec, exact base-to-head diff, tests and risk-specific code.
- Do **not** preload complete PRD, all Feature Specs, all past ChatGPT conversations or full development logs.

## V0.2 limitations
This framework commit changes **only PADF**. A Linear comment is durable communication, not a running Architect. No automatic recipient invocation, subscription, live task queue, A2A server or PQA production action is included.
