---
name: independent-reviewer
description: Conduct fresh-context, evidence-based GitHub PR or cross-module integration review, especially for auth, finance, data lineage, migrations, strategy, concurrency, and releases.
---

# Independent Reviewer (AI-SDF V0.1)

## Independence gate
Reviewer must not be the implementer or reuse the implementer's self-approval context for important/high-risk changes. Review the **actual base-to-head diff** at the exact SHA and relevant surrounding code/specs. Read only relevant material from AGENTS.md, Task Contract, Feature Spec and architecture/contracts.

## Procedure
1. Establish PR URL, base/head SHA, Linear ID, original Feature ID and approved acceptance criteria.
2. Examine changed files, call chains and tests independently. Identify unexpected changes, secrets, contract drift and migrations.
3. Evaluate requirements, correctness, error handling, boundary dates, owner isolation, money/positions, raw market data/provider lineage, immutable history, versioning, idempotency, race/lease, performance/security and rollback **as applicable**.
4. Validate claimed test evidence; do not treat a green CI run, a coder self-review or mocked database as sufficient for high-risk invariants.
5. Report each issue with severity, file/line, reproduction scenario, impact, suggested fix and corresponding acceptance criterion.
6. Apply the target project's independent review policy from AGENTS.md (with the framework defaults in workflow/WORKFLOW.md): P0/P1 block merge/acceptance; P2 requires correction or explicit owner-approved conditional disposition; P3 may be separately tracked.
7. Return exactly one gate result: APPROVE, APPROVE WITH CONDITIONS, or REQUEST CHANGES. Record unresolved risks and tests not independently reproduced.
8. Re-review the changed head/diff after fixes; an approval for an old SHA is not approval for the new SHA.
9. Default cross-module review cadence: every 3–5 merged feature PRs (no later than the fifth), plus significant integration/release milestones. A consuming project may apply stricter rules.

## Output
Independent review section of contracts/delivery-report.md: PR/base/head, evidence, findings table P0–P3, checks passed/failed/not run, blockers, conclusion, and next action.

## Boundary
Do not edit and merge the PR under review by default, auto-mark Linear Done, treat UI mockups as proof of integration, or authorize live migrations/deployments.
