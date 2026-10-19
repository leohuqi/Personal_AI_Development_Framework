# Master Agent Dispatch Record (copy per specialist stage)

Schema: `padf.agent-dispatch/v1` · status: `PLANNED / DISPATCHED / EXECUTION_OBSERVED / HANDOFF_RECEIVED / RECONCILED / BLOCKED`

**Fill actual references, do not invent identifiers or PASS:**
- Context ID / Feature ID / Linear or test GitHub Issue:
- Dispatch ID / created_at / Master run reference:
- Master routing rationale, target role and **Skill path@commit SHA**:
- Approval / bounded design Task Contract permalink@SHA / design scope and stop conditions:
- Dependency dispatch IDs and verified prior Handoff/reconciliation refs:
- Architecture scope / system baseline @SHA and applicable Owner approval:
- Expected deliverables / quality rubric IDs:
- Execution mode: ROLE_SIMULATION | HUMAN_RELAY | RUNTIME_DISPATCH
- Actual launch initiated by: SAME_SESSION | HUMAN_OWNER | MASTER_RUNTIME_TOOL
- Persisted dispatch URL before agent launch:

**Specialist must add from separate execution:**
- Execution ID; execution session ID/reference or external runtime-issued task ID:
- Tool/runtime product and actual initiator; dispatch link retrieved; Skill version observed:
- Session evidence mode (RUNTIME_ISSUED / SESSION_VERIFIED / OWNER_ATTESTED / SELF_REPORTED / NONE):
- Execution status, start/finish, independent execution evidence:
- Handoff ID/permalink; artifact manifest and source commit SHA; tests/render statuses:
- Receiver ACK/NEEDS_REFINEMENT and unresolved messages:

**Master only after receiving the real Handoff:**
- Live checked sources/Owner approvals/older artifact revisions + observation time:
- Reconciliation ID/permalink; result CONTINUE/BLOCKED/NEEDS_REFINEMENT:
- If continued: next dispatch ID and why; otherwise exact blockers:
- Independent DESIGN Review and separate coding authorization (if applicable):

**Never turn a role label or self-reported link into evidence that a separate agent runtime ran.** See [contract](../contracts/agent-dispatch.md) and [live runbook](../workflow/master-orchestration-validation.md).
