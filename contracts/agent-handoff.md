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

## V0.3 design artifact extension
For Architect/UI Producer -> downstream Agent, include `handoff_kind: DESIGN` and cite [Architecture Package](architecture-design.md) or [UI Package](ui-design.md), immutable versions and Owner-approved Feature Spec. Use the **same V0.2 envelope**, message IDs and ACK rules; do not introduce a parallel handoff transport.

Optional-as-applicable fields:
- `architecture_scope`, `solution_architecture_ref` and `technology_stack_ref` (system-level), `module_design_ref` and `system_baseline_ref` (module-level), `module_interface_contract_ref`, `code_structure_ref`, `schema/api/workflow_contract_refs`, `diagram_manifest_ref`, `diagram_generator_lock_ref`, `diagram_render_status`.
- `project_ui_profile_ref`, `ui_design_ref`, `prototype_level`, `concept/high-fi/interactive_artifact_refs`, interaction test status.
- `dependency_manifest_ref`, `design_review_ref` (only if actually completed), `design_gate_ref`, `stale_checks`, and `unresolved_design_conflicts`.

Producer marks completed only with actual evidence. Receiver checks required artifacts/source revisions and ACKs or responds NEEDS_REFINEMENT/BLOCKED. **Master** owns Design Gate and next-role routing; **Independent Reviewer** owns risk-required design quality opinion, never the Gate. Completed Handoff does not start Coder automatically.


Do not hand the Module Architect a not-yet-approved proposed system baseline and treat it as binding. In a combined SYSTEM/MODULE workflow, attach a verified approved system baseline SHA to the downstream MODULE handoff, then check it again before Coder starts.


## V0.3 provenance extension for actual multi-session pilot
When verifying Master orchestration, each HANDOFF must additionally cite `dispatch_id`, `execution_id`, actual source `skill_ref_used@SHA`, sender execution session/run evidence, `handoff_ref` and artifact source SHA; recipient Master records the live read/ACK or NEEDS_REFINEMENT. A Master-written Handoff claiming to be from a specialist is not independently sourced execution evidence. Owner relay/attestation is distinct from Master-launched runtime dispatch. See [Dispatch Chain](agent-dispatch.md).
