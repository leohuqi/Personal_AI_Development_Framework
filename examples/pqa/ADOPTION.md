# PQA Adoption Example — AI-SDF V0.1

Project: [Personal Quant Analyst (PQA)](https://linear.app/leohuqi/project/personal-quant-analyst-pqa-4cbef78ec5cd) / [GitHub repository](https://github.com/leohuqi/Personal_Quant_Analyst).

## Existing foundation (preserved)
- The stable original Feature ID (such as PORT-015) is **different** from a Linear issue ID (such as LEO-134).
- GitHub owns docs/feature-catalog.md, docs/features/*, product-requirements.md, architecture.md, frontend-design-v2.md and actual code.
- Linear owns backlog, priorities, blocking relations, Cycles and issue state. No duplicate full PRD/Feature Spec in Linear.
- AGENTS.md and docs/development-guidelines.md remain authoritative for PQA security, review, test and documentation policy.
- The existing .github/workflows/check.yml already runs checks on pull requests and main; the PADF framework does not alter it.

## Starting inventory (2026-10-11)
151 Feature IDs in Linear: 111 historic implementation Done, 4 In Review pending production acceptance, 36 Backlog. Do not auto-close the latter 4; status in source docs may evolve. Read live Linear/GitHub before acting.

## Exact context selection
- UI issue: AGENTS.md + relevant docs/features/*.md + docs/frontend-design-v2.md.
- API: relevant spec + relevant docs/api-spec.md section.
- PostgreSQL migration: relevant spec + relevant docs/database-schema.md section, isolated real PG.
- Strategy/DSL and market data: relevant feature specs and only affected architecture/strategy sections.
- Deployment: docs/features/operations.md + docs/deployment-alicloud.md; **separate owner authorization**.
- Do not load unrelated PRD, full development plan or development log by default.

## Suggested pilot (requires separate approval)
Pick one unblocked, bounded, not-yet-implemented feature or a low-risk enhancement. Review scope/UX/testability before starting. For example PORT-006 must be verified and ready before planning dependent PORT-015, rather than bypassing Linear blocking relations.

## Configuration checklist — not completed by committing these files
- [ ] Owner confirms Linear GitHub integration and linking for PQA (PR title/branch contains LEO-NNN).
- [ ] Configure GitHub PR status mapping without auto-closing Linear Done on merge.
- [ ] Owner enables and verifies Codex Automatic Review for this private repository.
- [ ] Ensure code review findings and GitHub Actions statuses are visible to the coordinator (access/permissions).
- [ ] Run one trial task with explicit owner approval, review its actual results.
- [ ] Only later extract generic Skills to independent framework repository. No service/Loop engine required.

## Example dispatch text
"Use feature-coder for Linear LEO-134 / PORT-015 only after PORT-006 is satisfied and the owner authorizes development. Load the linked Feature Spec plus relevant UI/API docs; implement approved scope, test with isolated PG/Playwright as applicable, open PR and do not merge or deploy. Submit Delivery Report for independent review."


## Framework-first review boundary
PADF is the canonical framework source. **PQA Draft PR #7 remains open, unchanged and unmerged** until the owner reviews PADF. After approval, revise PQA PR #7 to consume the approved PADF approach; do not silently fork rules, change existing Feature statuses, or deploy PQA.
