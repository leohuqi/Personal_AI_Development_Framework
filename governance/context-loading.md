# Context loading — least necessary source

1. Read target project `AGENTS.md` and the assigned tracker Issue/Task Contract.
2. Load the *approved and versioned* Feature Spec or explicit owner scope.
3. Load only affected UI prototype, API contract, database schema, architecture/ADR, deployment runbook or tests.
4. Do not preload full PRD, unrelated project documents, all feature files, entire development plan or logs.
5. Escalate unresolved contradiction, missing contract or significant scope change to Master/Owner.
6. Keep exact feature and source SHA references in Task Contract/Delivery Report; never include secrets or real customer/account data in prompts or repos.

GitHub versioned documentation and code are authoritative for technical scope; Linear is authoritative for current execution state, dependencies, priority and Cycle.

## V0.2 shared context and resume
- Resolve [Shared Task Context](../contracts/shared-task-context.md) as an **index of links**, not a copy of PRD or prior chat. Check context_id, both task and Feature IDs, Owner approval, source SHA and pending threads.
- On new session, use [Checkpoint & Resume](../contracts/context-checkpoint.md): fetch live Git HEAD, approved spec/ADR revisions, Linear status/dependencies and messages before continuing. Mark stale context and escalate mismatches.
- Minimal profile (Coder/QA): AGENTS, Task Contract, affected spec/contracts and pending messages. Design profile (Architect/UI): affected design/API/ADR context. Review profile: requirements/ACs, exact diff and verifiable evidence, with independent reasoning.
- Do not load Coder's transcript or chain of thought into fresh-context review. Do not assume a saved checkpoint, comment or handoff is owner authorization or an accurate current state.
- Publish only task-relevant links and concise status; never store credentials, raw customer data or full transcripts in shared messages/snapshots. See [Context Governance](context-governance.md).

## V0.3 specialized design context
- Architect profile: affected Feature Spec, current architecture/API/DDL/ADR/workflow, diagram-design pinned integration references and task-specific approved style profile; do not preload unrelated diagrams or all schema tables.
- UI Designer profile: approved project UI Profile, current component library/tokens, affected screens and task interactions, relevant Architect API contracts, not another project's visual tokens.
- Master/Reviewer: lightweight dependency manifest, exact Architect/UI artifact versions, review/gate decisions and Owner approvals. Reviewer in DESIGN mode reads source artifacts and requirements independently; do not import designer's private reasoning as proof.
- New versions of approved API, design/profile or schema require targeted dependent stage and Design Gate freshness re-evaluation.
