# CACF V0.2 validation playbook

Test the PADF framework in increasing levels of realism. **Passing the simulator is not proof that independent AI agents or Linear/GitHub integrations work.**

## L1 — Static / contract checks (automatic)

Run from the root of this repository with Node 20+:

```bash
node scripts/validate-cacf.mjs
node --check tests/cacf/run-validation.mjs
```

The first command verifies required Skill and contract files, schema markers, local Markdown references and the principal workflow integration points. The second performs a JavaScript syntax check. It does **not** validate semantic JSON schemas or live connectors.

## L2 — Cross-process protocol fixture simulation (automatic)

```bash
node tests/cacf/run-validation.mjs
node tests/cacf/run-regressions.mjs
```

The fixture starts **separate Node processes** that communicate by a temporary on-disk JSON store. It checks:
1. Coder request persisted and architect reply correlated.
2. Message-id retry does not duplicate a request.
3. Checkpoint and resume from a new process can recover the reply.
4. Coder→QA handoff and receiver ACK preserve NOT_RUN status.
5. Changed code HEAD blocks resume and stale handoff acknowledgement.
6. Changed approved spec blocks resume.
7. Missing Owner approval blocks resume and new checkpoint.

The temporary fixture directory is deleted at the end. No production code, PQA data, live agents, Linear or GitHub are touched. This is a **protocol behavior simulation**, not E2E.

The suite always creates a unique child directory. Optional `PADF_CACF_STORE_DIR`
selects an existing, non-filesystem-root **parent**, never a directory to overwrite
or delete; existing files (including `shared-context.json`) are preserved on both
success and failure. Internal `--agent` mode receives the exact child directory
from the parent and does not create or clean directories.

The additional review regression suite checks caller-data preservation on success
and failure, root-directory rejection, request/response retry deduplication,
same-ID payload conflict rejection, retrieval of every non-terminal response
status (including historical RESPONDED records), receiver identity, blocked-event
reconciliation and explicit event consumption/closure. These remain fixture tests.

## L3 — Real cross-session agent acceptance (separately authorized/manual)

Use an isolated, **non-PQA** trial issue/project or designated safe test records with durable storage enabled. An owner must authorize the bounded pilot and the involved tools/permissions.

1. Master in session A creates the Shared Task Context with the **actual** trial issue ID, source SHA and approval. Link a Task Contract.
2. Start Coder in a distinct session B. Coder posts `CLARIFICATION_REQUEST` in the test issue with `context_id`, `message_id`, `thread_id`, a receiver and a permalink.
3. End session B. Start Architect in a **fresh** session C without past transcript. Architect resolves the task by the stable ID, pulls the persisted question and posts a correlated RESPONSE.
4. Start a **new** Coder session D without the previous conversation. Verify it reads the response, checks actual Git/spec/issue state, and resumes from a published Checkpoint with exact prior SHA.
5. Produce a bounded Handoff to an independent QA session E. QA ACKs the handoff, refuses missing evidence, and records NOT_RUN until it actually tests.
6. Deliberately change the test branch/spec revision (safe fixture only). A new receiving session must detect drift and STOP/ESCALATE instead of silently continuing.
7. Try a `CHANGE_REQUEST` with no owner approval. The receiver must not execute scope expansion. Never test destructive operations or production deployment.
8. Independent Reviewer inspects the exact changed diff and approved requirements, **not** the Coder's self-approval; record findings and reviewed SHA.
9. Master reconciles all message permalinks, evidence, observed statuses and Owner disposition. Close test records; do not mark live application work Done.

### L3 evidence required

Record trial issue URL, source commit, separate session identifiers (without conversation transcript), message permalink/ID pair, response/ref, checkpoint and handoff URLs, exact QA/reviewed head SHA, PASS/FAIL/BLOCKED/NOT RUN for each step and reproducible blockers. A message drafted but not durably written is NOT_PERSISTED. A posted message that no agent has read does **not** count as delivered. Only successful fresh-session retrieval counts as acceptance evidence.

## L4 — PQA pilot (deferred)

After L1–L3 evidence and explicit project authorization, run a small low-risk PQA task in a separate branch. **Do not modify PQA Draft PR #7** as part of this validation.

## Acceptance gates
- L1/L2 PASS is prerequisite to consider framework merge **subject to repository governance**.
- L3 validates actual persistence and independent agents; if unavailable, label NOT RUN and don't claim multi-agent E2E success.
- L4 is a separate, project-adoption gate.
- Distinguish framework Owner approval, CI results, independent review, merge and production adoption. Never infer one from another.
