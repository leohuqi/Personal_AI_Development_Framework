# Shared Task Context Contract — PADF V0.2

A Shared Task Context (STC) is the **task-centered index of authoritative references and current coordination state**. It is not a second PRD, a transcript, a substitute for Linear, or a mutable source of approved product truth.

## Required identity and anchors
- schema_version: padf.shared-task-context/v1
- context_id: stable identifier scoped to the project and task (example: PQA-LEO-134)
- project/repository and Linear issue URL/ID
- original immutable Feature ID(s), distinct from Linear IDs
- owner authorization reference, authorized environment and bounds
- approved Task Contract URL/version
- linked Feature Spec(s), design/API/architecture/ADR refs and **immutable commit/revision** where possible
- implementation branch, expected base SHA, current observed head SHA, PR URL (if any)
- assigned agent roles and their bounded responsibilities
- current tracker status, as **observed from Linear at timestamp**, not asserted by a local file
- open/blocked message IDs, handoff/checkpoint references, artifact/evidence links and next authorized action

## Storage model: index, not duplication
- **GitHub**: code, versioned technical/feature/design specifications, ADR, PR diff, CI and review evidence.
- **Linear**: current issue status, priority, blockers, dependencies, Cycle and task discussion/message threads.
- **Agent runtime**: transient computations and conversations. No persistence guarantee.
- **STC**: reference index assembled on demand from the sources above. Optional lightweight Markdown/YAML snapshot may be attached to the task record for recovery, but is never authoritative over source systems.
- **Checkpoints**: append-only/revisioned snapshots with stable links, attached to the relevant task/PR discussion or an explicitly configured durable location. Do not silently commit transient session dumps to the framework repository.

## Update and authority
1. Resolve project AGENTS.md, the assigned issue and Task Contract; read the latest valid STC reference, then only related documents.
2. Stamp observation time, code base/head and linked approved spec revision.
3. Store new **facts with evidence links**; distinguish CONFIRMED, PROPOSED, OBSERVED, UNKNOWN.
4. Promote approved decisions into the appropriate Feature Spec/ADR/API document through normal review; link the resulting revision. A message or checkpoint alone cannot approve a decision.
5. On disagreement with GitHub or Linear, stop relying on the stale snapshot and reconcile the sources; do not last-write-wins over a signed-off spec.
6. A receiving agent must validate its authorization and pending messages before any work.

## Minimal illustrative index (not a live PQA record)

    schema_version: padf.shared-task-context/v1
    context_id: PQA-LEO-134
    project: PQA
    repository: leohuqi/Personal_Quant_Analyst
    linear_issue: https://linear.app/example/issue/LEO-134
    original_feature_ids: [PORT-015]
    task_contract_ref: "<permalink-and-revision>"
    owner_approval_ref: "<approval-reference>"
    source_baseline:
      feature_spec: "docs/features/portfolio.md@<approved-sha>"
      base_sha: "<sha>"
      observed_head_sha: "<sha>"
    agents: [master-orchestrator, feature-coder, qa-tester, independent-reviewer]
    pending_message_ids: []
    latest_checkpoint_ref: "<durable-link-or-none>"
    latest_handoff_ref: "<durable-link-or-none>"
    observed_linear_state: "In Progress"
    observed_at: "<ISO-8601-with-offset>"
    next_authorized_action: "<bounded-action>"

Do not use placeholder references as authorization or test evidence. Source files and issue identifiers in the example are illustrative only.
