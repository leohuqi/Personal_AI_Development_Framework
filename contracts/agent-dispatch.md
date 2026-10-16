# Agent Dispatch & Execution Evidence — PADF V0.3

Schema: `padf.agent-dispatch/v1`. **Goal:** make it possible to test whether Master actually coordinated `Dispatch → Execution → Handoff → Dependency Reconciliation`, rather than an assistant writing several documents under different role names.

This contract extends the existing [Task Contract](task-contract.md), [Agent Message](agent-message.md), [Agent Handoff](agent-handoff.md), [Checkpoint](context-checkpoint.md) and [Stage Dependency](agent-dependency.md) protocols. It is a **durable evidence chain**, not a scheduler, agent runtime or automatic wake-up service.

## Three explicitly different execution modes
| `execution_mode` | Who starts the specialist | What can be claimed |
| --- | --- | --- |
| `ROLE_SIMULATION` | One session writing as multiple roles | Role/protocol simulation only; **cannot pass actual Master Orchestration** |
| `HUMAN_RELAY` | Master issues task; Owner manually starts an **independent** specialist session using only the persisted dispatch link | **Master-coordinated cross-session** execution, *not* Master-launched automation; requires real distinct session evidence or qualified Owner attestation |
| `RUNTIME_DISPATCH` | Master uses an actual supported task/agent dispatch capability and receives a real runtime task ID | **Master-launched** orchestration if external runtime evidence confirms it; a printed TASK_REQUEST is insufficient |

No automatic transition among modes. Never label HUMAN_RELAY as RUNTIME_DISPATCH, or a self-authored label as proof of a separate process. The session identifier may be a safe opaque handle; never publish credentials, private transcripts or secret URLs. If the runtime cannot expose a verifiable session identifier, record `OWNER_ATTESTED` and report the independent-session verification limitation rather than claiming objective proof.

## Immutable evidence chain (one logical stage)
1. **DISPATCH — authored by Master before execution.** Persist `dispatch_id`, `context_id`, target `role`, actual approved Task Contract and Feature ID, exact PADF Skill SHA, input spec/system-baseline refs, `depends_on_dispatch_ids`, expected artifacts, bounded scope/stop conditions, owner authorization reference as applicable, `execution_mode`, initiator and `dispatch_ref` permalink. Master decision/reason and created timestamp must be visible. A dispatch is a **request**, not execution.
2. **EXECUTION — from real receiving session/runtime.** Receiver fetches the dispatch, checks allowed scope and live dependency/version refs, records `execution_id`, `executor_role`, `executor_session_ref` or safe opaque runtime task ID, `started_at`, `dispatch_ref_read`, `skill_ref_used`, `initiated_by` and evidence classification (`RUNTIME_ISSUED`, `SESSION_VERIFIED`, `OWNER_ATTESTED`, `SELF_REPORTED`, `NONE`). Self-report alone is not independently verified execution.
3. **HANDOFF — produced by execution owner.** Persist `handoff_id/ref`, `dispatch_id`, `execution_id`, sender/receiver, exact immutable artifact/source SHA refs, test/render/prototype `PASS/FAIL/BLOCKED/NOT_RUN` evidence, open decisions and ACK/NEEDS_REFINEMENT. A generated message without verified durable permalink is NOT_PERSISTED.
4. **DEPENDENCY RECONCILIATION — performed by Master after receiving handoff.** Independently fetch live issue, approval, prior stage artifact SHA, source/Skill versions, blockers/pending messages and review obligations; record `reconciliation_ref`, `master_run_ref`, status `CONTINUE/BLOCKED/NEEDS_REFINEMENT`, reasons, source observation and explicit `next_dispatch_id` when applicable. A new dependent dispatch must cite this reconciliation and prior handoff and **cannot predate it**.

**Handoff ≠ approval**. For `architecture_scope: both`, SYSTEM may be PROPOSED and reviewed as a draft, but the formal MODULE stage must not be marked completed/ready until its `system_baseline_ref` matches an applicable Owner-approved SYSTEM revision. Similarly an L/XL design cannot pass Design Gate without fresh independent Design Review. Owner coding authorization remains separate.

## Evidence identity and validity
- Master session/ref and specialist execution session/ref must be **different and independently corroborated** to claim actual cross-session work. For HUMAN_RELAY, capture the human start/attestation reference. For RUNTIME_DISPATCH capture the tool-issued task ID and completion evidence.
- Verify chronological ordering and consistency of `dispatch_id`, `context_id`, `role`, Skill revision, dependency refs and artifact SHA across all four records. Wrong/new head or missing approval => STALE/BLOCKED; never rewrite history as PASS.
- The same GitHub login may post several records on behalf of connected clients and **does not prove identity or separation of Agent Sessions**. An `agent_role:` field is not enough.
- Simulation sample fixtures may use synthetic URLs and fabricated IDs to test validation behavior. A fixture PASS proves **only contract checking**, not actual Agent invocation, Owner attestation, design quality, external tools or their output.
- Use [orchestration verifier](../lib/orchestration-evidence.mjs) for local **metadata-only** checks. Only independent inspection of live runtime / task / GitHub evidence can establish the claimed mode.

## Minimal proof per specialist
| Role | Master dispatch must specify | Receiver's own deliverables |
| --- | --- | --- |
| solution-architect | New APP/platform scope, desired constraints, architecture baseline selection task | Concrete stack & ADR, system architecture, app-wide module/code topology, real diagrams |
| module-architect | Exact **approved** `system_baseline_ref`, bounded target module, prior SYSTEM handoff | Package/classes/ports/contracts, module diagram, error/retry/data/test seams without new stack |
| ui-ux-designer | Exact approved project UI Profile or creation approval, target screens, L1/L2/L3 and required interactions | Philosophy, concept/UI spec, high-fi source, interactive prototype where selected, profile conformance evidence |

See [live validation runbook](../workflow/master-orchestration-validation.md) and [skill-quality rubric](skill-delivery-evaluation.md).
