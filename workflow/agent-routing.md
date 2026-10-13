# Routing Skills by task size

| Work type | Route |
| --- | --- |
| S — isolated bug | Authorized Coder → focused tests → risk-based Review |
| M — feature | Master/approved Feature Spec → Coder → QA & CI → Independent Reviewer → Owner |
| L — cross-module | Architecture impact & feature splitting → bounded delivery → integration review |
| XL — new product / major change | Discovery / UX / architecture approval → Roadmap → incremental MVP Cycles |

Default to a single Coder; parallel work requires clear non-overlapping boundaries, separate worktrees and explicit authorization. Future UI Designer, Architect, Product Analyst, Planner and Iteration Manager Skills are planned, **not included** in V0.1.

## V0.2 context routing (all task sizes)
- Master is accountable for resolving context_id, issue + immutable Feature ID, approved source revisions, owner authorization, and actionable unresolved messages **before** task dispatch.
- The context-coordinator Skill is invoked **as a procedure** by the active role as needed: resolve_context, read_messages, record_message, create_checkpoint, prepare_handoff, resume_context and reconcile_context. It does not independently dispatch agents.
- S bugs: minimal task context/checkpoint at handoff; avoid heavyweight choreography.
- M/L/XL: typed handoffs at architect/design/coding/QA/review boundaries as applicable; link exact artifacts and source SHA. Parallel roles may converse directly, but durable decisions and approval-affecting changes must be traceable.
- Clarifications go to relevant role, unresolved blockers/conflicts to Master, significant product/UX/architecture scope changes to Owner. Message routing does not change approval policy.
- Fresh-context Independent Reviewer gets approved source contracts, exact diff and evidence—not the Coder's whole conversation.
- Follow [CACF workflow](context-communication.md) and [Agent Message](../contracts/agent-message.md) rules.
