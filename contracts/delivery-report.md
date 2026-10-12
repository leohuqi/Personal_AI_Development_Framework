# Delivery Report — Template

## Identity
- Linear issue:
- Original Feature ID:
- Agent/role (Coder, QA, Independent Reviewer, Master):
- PR URL; base SHA; head SHA:
- Environment and versions:

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
