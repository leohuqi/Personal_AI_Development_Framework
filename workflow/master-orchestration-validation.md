# PADF V0.3 — Real Master Orchestration & Specialist Skill Acceptance Runbook

**Acceptance target:** separate verifiable (1) **Master Dispatch → Specialist Execution → Handoff → Dependency Reconciliation** from (2) **Owner-rated quality of Solution Architect, Module Architect and UI Designer**. This is a manual/human-launched workflow unless an actual connected runtime dispatch action is available. Skills/documents alone do NOT create background agents.

## Scenario and first message (Owner speaks only to Master)
**Pilot:** personal Expense Ledger APP: enter spending amount, merchant, category dropdown with merchant-rule prefill and override, location with source/provenance and consented current GPS, user-exported WeChat/Alipay bill import, duplicates/refunds and error states. Use synthetic data; no account credentials, scraping, production deploy or PQA edits.

Send to **new Master session A**:
> Act as PADF V0.3 Master Orchestrator for an isolated Expense Ledger acceptance pilot. The goal is to test your actual specialist dispatch and handoff, **not** to ask you to design the APP yourself. Load the approved PADF V0.3 branch/Skill revisions and `workflow/master-orchestration-validation.md`. Derive `architecture_scope`, risk, role order and deliverables. Produce real durable Task Contracts and dispatches for solution-architect, module-architect and ui-ux-designer as relevant. Stop on material approval gaps. After each *actual* independent execution, read and verify its Handoff and artifact SHA, reconcile dependencies and only then make the next dispatch. At the end give me the three role deliverables and their exact refs for individual quality grading. Never represent role-simulation or an unlaunched dispatch as agent execution; record HUMAN_RELAY versus RUNTIME_DISPATCH accurately.

**Do not supply the Architect's technology choices, each Specialist's design text, or a detailed routing script in the Owner's prompt** — the goal is to see whether Master independently chooses and enforces them.

## Master session A (kept separate from specialist work)
1. Master fetches active PADF version/Skill SHAs and writes `Master Plan` to a durable GitHub test issue or equivalent. Declare `context_id`, test-only Feature ID, L (or actually reasoned size/risk), `architecture_scope` and UI L1/L2/L3 (require L3 in this user-acceptance pilot when tools support it). Plan SYSTEM, MODULE and UI stages with explicit dependencies.
2. For any real new system baseline, Solution Architect first delivers a **PROPOSED** stack; Owner approves/adjusts it by durable record before MODULE stage can be called formally ready. If Owner prefers not to approve a demo baseline, Module Architect may generate a **conditional draft** only and the strict Gate must remain BLOCKED.
3. Master issues one [Agent Dispatch Record](../contracts/agent-dispatch.md) with bounded Task Contract, exact skill revision, artifacts expected and real permalink **before** recipient session begins. Publish an Agent Message `TASK_REQUEST` if available.
4. If runtime offers an actual dispatch tool, Master invokes it and records task ID (`RUNTIME_DISPATCH`). Otherwise Master stops and asks Owner to launch the new specialist session using **only the dispatch URL** (`HUMAN_RELAY`). Master does **not** write specialist artifacts in session A.
5. Preserve original Master session identity/ref A across both handoffs. Do not fabricate a session ID when a platform does not expose it.

## Specialist session B/C/D — new sessions (no Master chat transcript)
- **B Solution Architect:** user starts a fresh session and supplies ONLY Master's dispatch URL; receiving session loads its own pinned Skill and approved scope, writes actual stack/system architecture/app code structure with real professional diagrams when its external Skill is available, and posts an execution receipt + durable Handoff with exact Git SHA. Record actual session/ref when available, or Owner-attested separate launch.
- **Back to A:** Master retrieves the Handoff **live**, verifies artifact refs, records ACK and reconciliation decision. Obtain Owner's actual approval for SYSTEM before formal MODULE dispatch; Owner can instead explicitly choose conditional draft route with BLOCKED Gate.
- **C Module Architect:** use ONLY its own Master dispatch and exact approved SYSTEM ref; independently deliver module packages/classes/ports/API/schema/workflow/test seams, matching module diagrams; do not replace project-wide stack. Post distinct execution receipt and Handoff.
- **Back to A:** Master verifies module baseline match, issues UI dispatch when dependencies permit, or records BLOCKED/NEEDS_REFINEMENT and routes correction.
- **D UI/UX Designer:** from new Master dispatch, read approved project UI Profile (or obtain creation approval), produce own design philosophy, concepts/high-fi and clickable L3 prototype as selected, show category override/merchant prefill/location provenance/error states. Save actual editable source and interaction test evidence; post receipt/Handoff.
- **Back to A:** Master resolves all three artifact references, each actual execution/session provenance, and Design Gate. For task L a fresh independent Reviewer session **E** must inspect exact design revisions before DESIGN_READY; Owner grades outputs separately and authorizes any coding separately.

If design dependencies dictate UI concept before module contracts, Master may choose that order and record why; tests validate **decision provenance and prerequisite satisfaction**, not a hard-coded fixed role order. The two Architects still cannot cross the approved-baseline gate.

## Evidence and Owner acceptance
| Required observable | Owner should see |
| --- | --- |
| **Dispatch** | Master's persisted task-specific decision/why, before recipient work, named target Skill@SHA and authorizing issue |
| **Execution** | Actual distinct specialist session or runtime task receipt, read of dispatch URL, initiation mode with honest session evidence |
| **Handoff** | Execution-ID-linked source files, diagrams/UI source/interactive prototype, immutable SHA and verified durable link |
| **Reconciliation** | Master live-fetched verification of baseline/permissions/previous artifacts and blockers **before** next stage dispatch |
| **Routing independence** | Owner gave only business goal; Master produced role selection, dependencies, corrections and next decisions |
| **Delivery quality** | Three Owner-completed [Skill Delivery Evaluation](../contracts/skill-delivery-evaluation.md) sheets at exact Skill/artifact version |

Record `ROLE_SIMULATION` / `HUMAN_RELAY` / `RUNTIME_DISPATCH` as separate outcomes. In HUMAN_RELAY, Master coordinates but **the human launches sessions**. If actual externally issued task IDs are unavailable, do not claim autonomous Master dispatch.

## Acceptance criteria
- **OC-01 Dispatch sequencing:** Each specialist is assigned by Master before execution; durable exact Task Contract and agent Skill SHA.
- **OC-02 Independent execution:** Fresh external session/task references distinguish specialist from Master. Owner attestation explicitly marked less strong than objective runtime IDs.
- **OC-03 Handoff completeness:** Receiver's verified permalink/artifact source revision, original dispatch and execution references; no spurious PASS.
- **OC-04 Dependency reconciliation:** Master checks current Git/spec/system baseline/Owner approvals and earlier Handoffs **before** next dispatch; wrong SHA or missing approval stops.
- **OC-05 Honest origin:** Same-session role play cannot pass `CROSS_SESSION`; HUMAN_RELAY never mislabeled runtime-launched.
- **OC-06 Governance:** For L/XL, mandatory independent DESIGN Review; no DESIGN_READY or coding from chat status alone.
- **SQ-SA / SQ-MA / SQ-UI:** Owner independently grades each [role's delivery quality](../contracts/skill-delivery-evaluation.md). Failure means specialist Skill improvement required even when orchestration passes.

## What prior Issue #4 demonstrated
[PADF Issue #4](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/4) has sequential **role-scoped documents and a Master-labeled checkpoint** generated within one session; it is **ROLE_SIMULATION**, not independent Master-launched agent execution. Keep it as a useful negative-control sample, not a passing proof of actual Master Orchestration.

## Verification
Use `node tests/v0.3/run-orchestration-tests.mjs` for deterministic negative/positive **synthetic metadata** cases. The Node checker cannot inspect other ChatGPT sessions or authenticate the Owner; to accept a real pilot, Master and Owner must inspect live GitHub/task/runtime records and record any unavailable evidence as BLOCKED/NOT RUN. V0.3 adds no new runtime, task queue or background service.
