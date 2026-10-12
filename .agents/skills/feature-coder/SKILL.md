---
name: feature-coder
description: Implement one authorized Linear issue or bounded bug using its approved Feature Spec, relevant architecture and UI constraints, tests, and a reviewable GitHub PR.
---

# Feature Coder (AI-SDF V0.1)

## Input gate
Require an owner-authorized task, Linear ID + original Feature ID, approved scope, acceptance criteria, dependencies, relevant source/spec references, and an explicit target environment. Use contracts/task-contract.md. If incomplete, stop and return NEEDS REFINEMENT; do not invent product behavior.

## Steps
1. Read project AGENTS.md, then the referenced relevant Feature Spec; read only affected API/DB/UI/architecture portions per the context-loading policy. **Do not read unrelated project documents by default.**
2. Confirm current Git base/head, issue state, dependencies and a bounded implementation plan. Use a dedicated branch/worktree; do not edit another agent's active workspace.
3. Respect agreed requirements and architecture. Changes to external contracts, models, dependencies or UI design need impact analysis and approval according to project policy.
4. Implement smallest vertical slice (UI/API/data when relevant). Keep production code free of demo/mocked fallback data.
5. Add focused tests for behavior, error/empty/permission cases, idempotency and migration safety where applicable. For PostgreSQL-specific invariants use isolated real PostgreSQL; do not substitute SQLite or mocks.
6. Run focused checks while working; at handoff run the target project's documented test commands and applicable integration/browser tests, or disclose exactly why a check was NOT RUN.
7. Inspect diff for secrets, unrelated edits, generated artifacts, contract drift and backward compatibility. Update only affected specs, contracts and brief development log as required by AGENTS.md.
8. Commit and open a reviewable PR. Reference **both** Linear ID and original Feature ID in PR description; include scope, tests, screenshots (when UI), migration/rollback concerns, and known risks.
9. Hand over contracts/delivery-report.md evidence. Leave review and owner acceptance to independent agents/owner.

## Completion gate (developer handoff; not owner Done)
- Approved scope implemented and traceable to each acceptance criterion.
- Appropriate tests run and evidenced; missing tests explicitly flagged.
- PR created; no P0/P1 known regressions deliberately concealed.
- No direct production deployment or unapproved destructive migration.
- GitHub CI and independent review status reported as PENDING until independently observed.

## Never
- Auto-mark Linear Done; auto-merge; rewrite protected immutable business or audit history; alter production credentials; relax authorization or data lineage without owner authorization.
