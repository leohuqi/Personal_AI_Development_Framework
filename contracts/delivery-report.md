# Delivery Report — Template

## Identity
- Linear issue:
- Original Feature ID:
- Agent/role (Coder, QA, Independent Reviewer, Master):
- PR URL; base SHA; head SHA:
- Environment and versions:

## V0.2 context continuity / communication
- context_id and Shared Task Context permalink:
- Task Contract and Owner authorization refs:
- Input checkpoint/handoff IDs and versions (or N/A):
- Outgoing handoff ID, receiver, durable permalink and ACK/NEEDS_REFINEMENT state:
- Resolved message IDs with evidence links:
- Unresolved message IDs, BLOCKER/CHANGE_REQUEST state and responsible role:
- Observed Linear status and timestamp; approved spec revision; current branch/head SHA:
- Reconciliation result for stale checkpoints/spec/HEAD differences:
- Context finalization / open residual task refs:

These entries are observations/links, not evidence of implicit approval, message delivery or agent wake-up.

## Implementation (Coder)
- Approved scope delivered / not delivered:
- Changed paths and affected API/schema/design contracts:
- Migration or backward-compatibility impact:
- Docs updated (or N/A):
- Known risks, technical debt and deferred work:

## Test evidence (QA)
| Acceptance case | Expected | Actual | Status (PASS/FAIL/BLOCKED/NOT RUN) | Environment / evidence URL |
| --- | --- | --- | --- | --- |
| AC-1 | | | NOT RUN | |

- Commands run; tool versions:
- GitHub Actions run URL and **observed** conclusion:
- Desktop/mobile Playwright screenshot/report URLs if applicable:
- Isolated PostgreSQL migration/real-data proof if applicable:
- Explicitly skipped/unavailable checks and reasons:
- Defects with reproducible steps / assigned issues:

## Independent Review
- Reviewer identity/context independence:
- Exact reviewed PR and base/head SHA:
| Finding | Severity (P0–P3) | File/line | Scenario and impact | Resolution |
| --- | --- | --- | --- | --- |
| (none or evidence) | | | | |
- Decision: PENDING / APPROVE / APPROVE WITH CONDITIONS / REQUEST CHANGES
- Tests independently reproduced vs claimed vs NOT RUN:
- Residual risk and owner condition for P2, if any:
- Re-review status for newer SHA:

## Master acceptance decision
- DoR met? Yes/No
- CI passed at reviewed head? Yes/No/Unknown
- QA gate passed? Yes/No/Blocked
- Independent review approved? Yes/No/Pending
- Owner acceptance: PENDING / ACCEPTED / CHANGES REQUESTED / DEFERRED
- Linear next state and reason:
- Production release: NOT REQUESTED / SEPARATELY AUTHORIZED (evidence required)

Never represent CI green as independent business acceptance; never imply a merged PR is deployed.
