# Agent-to-Agent Handoff Contract — PADF V0.2

A handoff transfers **task responsibility and verifiable artifacts**, not an agent's hidden reasoning or authority. It can be between different roles, sessions or runtimes; no direct synchronous Agent connection is required.

## Required fields
- schema_version: padf.agent-handoff/v1
- handoff_id, context_id, Linear issue/Feature IDs, sender/receiver agent roles, created_at
- task objective and bounded scope; owner authorization/Task Contract reference
- expected next role/action and explicit stop/escalation conditions
- source baseline: approved spec revision, PR URL, base/head SHA, branch, relevant ADR/API/UI revision
- outcomes: what is completed vs not completed, each with artifact/evidence refs
- acceptance/test coverage: PASS/FAIL/BLOCKED/NOT RUN with provenance; no invented PASS
- pending message IDs, blockers, open design questions, dependencies, known risks
- current workspace ownership and integration boundaries if agents work in parallel
- delivery location/permalink and receiver acknowledgement or NEEDS_REFINEMENT response

## Producer procedure
1. Reconcile live issue/PR state and pending messages. Link changed paths/PR, exact revisions and evidence.
2. Write concise facts; tag unverified assertions and missing tests accurately.
3. Publish at a durable task/PR location and create a HANDOFF message pointing to its permalink.
4. Do not transfer permission to deploy/merge/expand scope; include existing owner approval reference only.
5. Record next responsible role and whether work is BLOCKED.

## Receiver procedure
1. Verify task identity, authorization, source revisions and assigned scope.
2. Resolve links to source specs/code/evidence and check pending messages.
3. ACK with accepted scope or NEEDS_REFINEMENT/BLOCKER if handoff is incomplete or stale.
4. Do not rely on sender's self-review as independent QA/Review. A reviewer should use fresh context: approved Task Contract/Feature Spec and actual diff at the exact SHA; handoff locates evidence only.
5. Continue only authorized work and publish a new checkpoint/handoff at the next boundary.

## Example — Coder to QA (illustrative only)

    schema_version: padf.agent-handoff/v1
    handoff_id: HO-PQA-LEO-134-001
    context_id: PQA-LEO-134
    linear_issue: "<canonical-linear-link>"
    original_feature_ids: ["<original-id>"]
    sender: feature-coder
    receiver: qa-tester
    created_at: "2026-10-13T12:00:00+08:00"
    task_contract_ref: "<approved-contract-permalink>"
    owner_approval_ref: "<approval-reference>"
    scope: "<approved-scope>"
    source_baseline:
      pr_url: "<pull-request-url>"
      base_sha: "<sha>"
      head_sha: "<sha>"
      approved_spec: "docs/features/strategy.md@<sha>"
    completed_with_evidence: ["<code-or-test-ref>"]
    not_completed: ["<explicitly-skipped-check>"]
    test_status: NOT_RUN
    pending_message_ids: []
    blockers: []
    next_authorized_action: "Verify acceptance criteria at the exact head SHA"
    stop_conditions: ["Spec revision conflict", "Unapproved scope change"]

A HANDOFF event records a transfer request; it does not automatically run the receiving agent.
