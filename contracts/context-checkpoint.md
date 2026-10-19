# Context Checkpoint & Resume Contract — PADF V0.2

A checkpoint is a **minimal, durable, versioned recovery pointer** for a bounded task/session. It is not an agent's chain of thought, full conversation, executable approval, or a replacement for Git/Linear live state.

## Required checkpoint fields
- schema_version: padf.context-checkpoint/v1
- checkpoint_id, context_id, task/Feature IDs, project and repository
- actor/role, session/run identifier if provided, created_at (timezone aware)
- owner authorization reference and Task Contract revision
- source_baseline: base SHA, **last observed head SHA**, working branch, approved Feature Spec revision, applicable API/ADR/UI revisions
- task_status_observed, observed_at and source; never declare acceptance from the checkpoint alone
- completed_with_evidence: only verifiable artifacts, tests, commits and URLs
- remaining_work: specific next actions within existing approved scope
- blockers, unresolved questions and pending message IDs
- current artifact refs (PR URL, diffs, screenshots, test reports)
- next_role and **next_authorized_action**, with stop conditions
- durable checkpoint permalink and supersedes_id where applicable

Checkpoint contents should normally be short and link to durable primary sources instead of inlining whole specs or logs. Do not store secrets or reasoning traces.

## Triggering
- Before planned session close/context limit; after a meaningful milestone; when switching agents; before review; at controlled pause/blocker.
- For unexpected crash, use the most recent available checkpoint: no guarantee that an interrupted runtime generated one.
- Avoid checkpoint-per-message churn. A final Delivery Report/PR can supersede working checkpoints.

## Resume algorithm (mandatory)
1. Identify task and **explicit owner authorization**. Resolve project AGENTS.md and task issue/Task Contract.
2. Find latest checkpoint from the canonical task/PR link. Check checkpoint schema/version, identity, supersession and permission to access each source.
3. Fetch live Git branch/head, approved spec/ADR revisions, Linear issue status/dependencies and unresolved agent messages. Do not blindly trust checkpoint state.
4. Compare current vs recorded SHA/revisions and contracts. If changed, examine the exact diff and determine whether it invalidates tests, review, scope or pending work.
5. If approval is missing, spec conflicts, ownership clashes, credentials are involved, or branch state is ambiguous: STOP, record BLOCKER, request Master/Owner direction. Never overwrite another worktree or silently widen scope.
6. Reconstruct only minimum context necessary for the next authorized action; mark stale references, record resume observation time, then continue.
7. Publish an updated checkpoint/handoff on the next meaningful boundary.

## Example (illustrative, not a live run)

    schema_version: padf.context-checkpoint/v1
    checkpoint_id: CP-DEMO-123-001
    context_id: DEMO-123
    repository: example-org/example-project
    linear_issue: "<canonical-linear-link>"
    original_feature_ids: ["<original-id>"]
    role: feature-coder
    created_at: "2026-10-13T11:00:00+08:00"
    task_contract_ref: "<approved-contract-permalink>"
    owner_approval_ref: "<approval-reference>"
    source_baseline:
      branch: "<working-branch>"
      base_sha: "<sha>"
      observed_head_sha: "<sha>"
      approved_feature_spec: "docs/features/batch-import.md@<sha>"
    task_status_observed: "In Progress"
    completed_with_evidence: ["<commit-or-test-url>"]
    remaining_work: ["Run authorized integration tests"]
    blockers: []
    pending_message_ids: ["MSG-DEMO-123-0001"]
    next_role: feature-coder
    next_authorized_action: "Reconcile current HEAD and continue bounded tests"
    supersedes_id: null

Never interpret an example as test evidence or an owner approval.
