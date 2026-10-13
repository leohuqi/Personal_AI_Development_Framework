# PADF V0.2 CACF — Verification Report

Date: 2026-10-13  
Scope: PADF only; PR #1, branch `feat/padf-v0.2-cacf`  
Environment: Node.js 22 / GitHub Actions ubuntu-latest

## Evidence and observed outcomes

| Level | Check | Status | Actual evidence |
| --- | --- | --- | --- |
| L1 | Required Skills/contracts, schema markers, local links | **PASS** | GitHub Actions CACF contract validation, run **38346227484**, step "CACF structural references and schema markers" |
| L1 | Validation JavaScript syntax | **PASS** | Same run, step "JavaScript syntax" |
| L2 | Cross-process protocol fixture suite (7 scenarios) | **PASS** | Same run, step "Cross-process protocol simulation" |
| L3 | Fresh independent AI agents exchange persisted messages and acknowledge handoff | **NOT RUN** | Requires independent ChatGPT/Work/Codex sessions and a deliberately authorized safe trial issue |
| L3 | Live Linear/GitHub cross-system message delivery | **NOT RUN** | No dedicated safe Linear pilot task or cross-connector trial configured |
| L4 | PQA real-world small Feature pilot | **NOT RUN** | Intentionally deferred; PQA Draft PR #7 not touched |

### L2 detailed PASS cases
1. Coder→Architect question persisted across distinct Node child processes; reply correlates with original ID.
2. Same message ID retried without duplicating request.
3. Checkpoint persisted; new process resumes and reads addressed reply.
4. Coder→QA Handoff includes exact head and NOT_RUN; receiver explicitly acknowledges.
5. Changed head blocks resume, and stale handoff is rejected.
6. Changed approved spec revision blocks resume.
7. Missing Owner approval blocks resume and new checkpoint.

The CI outcome is **success**; it checks the **fixture protocol simulator**, not actual AI Agent sessions. No claim of independent agent communication, Linear integration or production readiness is made.

### Observed release gates
- Owner approval of original framework scope: **RECORDED** on PR #1.
- Framework L1/L2: **PASS** at the commit that introduced the workflow, `db1005a81b978d12ca1e87ac1c74abfd53970636`.
- L3 genuine fresh-session collaboration: **NOT RUN**.
- Independent Reviewer approval for final head: **PENDING**.
- Merge: **NOT PERFORMED**; remains Draft for further review.
- PQA adoption/PR #7: **NOT MODIFIED**.

### How to reproduce
In a local PADF checkout:

```bash
node scripts/validate-cacf.mjs
node --check tests/cacf/run-validation.mjs
node tests/cacf/run-validation.mjs
```

GitHub Actions workflow: `.github/workflows/cacf-validation.yml`.  
Manual trial instructions: `tests/cacf/README.md`.

### Minimal Owner actions for L3
1. Authorize a **non-PQA sandbox** task (e.g. a trial issue within PADF) and permit limited GitHub/Linear access for the chosen independent sessions. Do not authorize production, merge or PQA changes.
2. Launch separate fresh-role sessions using the Task Context ID and provided trial instructions, one Coder and one Architect; verify the Architect obtains the question **from durable storage** rather than a pasted conversation.
3. Launch a separate QA (and ideally independent Reviewer) session to verify handoff and exact head.
4. Record permalinks, PASS/FAIL/BLOCKED/NOT RUN and blockers; return results for Owner acceptance. Avoid moving the framework PR to Ready/Merged until the agreed gates pass.

This report will itself alter the PR head and trigger another CI run. For the final head, read the latest Actions result before representing CI as passed.
