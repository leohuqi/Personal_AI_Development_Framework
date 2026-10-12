# PADF repository rules

- PADF is a generic Skills/framework repository, not an application runtime.
- Keep project-specific PQA rules in `examples/pqa/` or its own project; do not encode PQA-only test commands in generic Skills.
- Never load unrelated project documents by default. Read the assigned issue/Feature Spec and only affected architecture/API/UI/contracts.
- Preserve explicit role inputs, outputs, handoff contracts, review independence, acceptance and approval boundaries.
- Owner approves significant product/UX/architecture changes, bounded coding dispatch, production operations, destructive actions and final acceptance.
- CI green, PR merged, independent review passed, Owner accepted and production deployed are separate facts.
- Do not introduce Linear Loops, self-hosted orchestration or automatic issue dispatch without new authorization.
- Do not modify, close or merge PQA Draft PR #7 during PADF review.
