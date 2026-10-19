# Owner governance and risk gates

| Operation | Authorization |
| --- | --- |
| Read connected project and repo data | Allowed within granted permissions |
| Draft requirements/design/plan | Allowed, subject to owner decision before changing approved scope |
| Start a feature coding task | Explicit bounded owner authorization |
| Change major business/architecture/UI contracts | Owner approval |
| Run isolated tests or independent PR review | Allowed for authorized work |
| Merge a PR | Project CI/review/owner rules; not automatic by Skill |
| Mark a new Issue Done | Explicit applicable owner acceptance |
| Production deployment, destructive migration, credential rotation, deletion | Separate explicit owner approval and rollback plan |

CI passing, PR merging, independent review, owner acceptance and production deployment are distinct outcomes. P0/P1 block, P2 requires fix or owner-approved risk condition, P3 may be deferred. The Reviewer must assess the actual updated SHA.

## V0.2 agent communication authorization boundary
- A TASK_REQUEST or HANDOFF transfers **only existing authorized scope**. It cannot manufacture or expand Owner approval.
- CLARIFICATION_REQUEST/RESPONSE can resolve interpretation inside approved contracts; CHANGE_REQUEST altering business behavior, architectural baseline, UX or permissions requires applicable Owner approval and canonical source update.
- REVIEW_FINDING/BLOCKER carry evidence and route remediation; neither grants automatic execution or merge authority.
- Checkpoints, cached context and Linear/GitHub comments cannot silently override approved contracts. Stop and escalate conflicting official sources or stale approval references.
- Durable messages do **not** start another agent, schedule background work or implement a live agent communication service. See workflow/context-communication.md.

## V0.3 Design Gate authority (approved model C)
- Master owns routing and design readiness/dependency gate status; cannot claim independent design quality review or start unapproved development.
- Solution Architect owns whole-app architecture/technology choice proposals; Module Architect owns detailed module code design within an approved system architecture baseline. Neither can silently substitute for the other or grant framework changes.
- Solution/Module Architect and UI Designer own evidence-rich design proposals and self-checks; a completed design Handoff is neither independent approval nor coding authorization.
- Independent DESIGN Review **mandatory for L/XL and risk-triggered S/M**; Reviewer may mark APPROVE/APPROVE WITH CONDITIONS/REQUEST CHANGES on exact design revisions but cannot release the Master Gate. Missing review or P0/P1 -> BLOCKED.
- S/M low-risk review may be skipped only with Master recorded impact/risk rationale. Any material product/architecture/UI profile change requires Owner approval regardless of size. P2 must be fixed or Owner expressly accept risk conditions.
- Separate bounded Owner coding authorization and Task Contract are still required after DESIGN_READY. A read-only evaluator output does not dispatch a Codex or other agent.
