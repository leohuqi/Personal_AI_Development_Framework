# AI-SDF V0.1 Core Development Workflow

**Specification, not an engine.** This workflow is human-initiated with hosted GitHub Actions and separately configured Codex review; it does not run continuously.

## Actors
**Owner** makes product, UX, architecture, acceptance and production decisions. **Master** refines, plans, verifies readiness, delegates approved bounded tasks and reconciles QA/review evidence. **Coder** implements and tests. **QA Tester** independently verifies cases. **Independent Reviewer** checks the exact PR diff and risk. **Linear** tracks project/Cycle/issues, **GitHub** stores authoritative code/specs/PR/CI.

## State machine
| Linear state | Meaning for new work | Gate |
| --- | --- | --- |
| Backlog | Not yet ready / deferred / blocked | Feature scope and blockers documented |
| Todo | Ready | Definition of Ready + owner authorization |
| In Progress | Coding | Authorized Task Contract, dedicated branch |
| In Review | CI, QA, independent review, owner acceptance pending | PR at exact SHA, test evidence, findings |
| Done | Accepted | Owner decision and Delivery Report |
| Canceled / Duplicate | Not proceeding | Reason and links |

Imported historical Done may signify implementation archival only. Preserve the consuming project's legacy status semantics.

## Feature Loop — explicitly started
1. Owner/Master classify S bug, M feature, L cross-module or XL product. Reconcile PRD/UI/Architecture/Feature Spec with Linear ID and original Feature ID.
2. **Definition of Ready:** unambiguous scope and exclusions, approved Feature Spec/source SHA, resolved dependencies, design decisions/UX baseline, testable acceptance criteria, required tests and explicit approval.
3. Master creates [Task Contract](../contracts/task-contract.md); owner starts Codex on the approved bounded task. Linear Free **does not automatically dispatch**.
4. Coder implements the minimal vertical slice, unit tests and relevant docs, opens GitHub PR including both IDs; no production deployment.
5. GitHub Actions runs project CI on PR; QA verifies acceptance with PASS/FAIL/BLOCKED/NOT RUN; Reviewer separately examines exact base-to-head diff, risk and evidence.
6. Failing QA/CI/review returns to bounded rework, then retest and re-review new SHA; P0/P1 block merge/acceptance, P2 needs fix or explicit Owner-approved conditions, P3 tracked.
7. Master summarizes evidence and remaining risks. Only applicable Owner approval permits newly developed Issue Done. PR merge ≠ deployment or business acceptance.

## Iteration Loop — owner initiated
Select small vertical, independently usable MVP slices; plan current 1–2 Cycles in detail, further Roadmap coarsely. Track dependencies, UI/API/data/test work and integration criteria. At Cycle end review integrated behavior, test coverage, remaining technical debt and feedback-based Bug/CR. Default separate integration review every **3–5 merged feature PRs (no later than fifth)** and at significant milestones / pre-release; project policy may be stricter.

## Failure and security gates
Stop on ambiguous specs, missing prerequisites, unapproved architecture changes or blocked dependencies; never invent product behavior. A green CI or self-review does not constitute independent approval. Reviewer must use fresh context for significant changes; re-review altered head. Missing evidence is NOT RUN, not PASS. Destructive migrations, production deployments, credential changes and deletion always require separate explicit authorization. No unbounded automatic retry or hidden background monitoring.
