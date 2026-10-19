# Owner-facing Specialist Skill Delivery Quality Evaluation — PADF V0.3

Schema: `padf.skill-delivery-evaluation/v1`.

**Two independent questions must be answered:** (A) Did the Master coordinate **real independent specialist executions** via a valid [Dispatch chain](agent-dispatch.md)? (B) Are the actual design deliverables of each Skill useful and correct? A PASS on A never implies B; a polished diagram never proves A.

## Quality dimensions and scoring
For each named mandatory criterion record `0 = MISSING`, `1 = INADEQUATE`, `2 = ACCEPTABLE`, `3 = STRONG`, or `N/A` with **specific applicability rationale**. Provide artifact permalink **at immutable SHA**, one concrete strength/problem per criterion and verified test/render evidence. Missing files/links or unverifiable "interactive" claims receive 0 / NOT RUN; do not infer a professional skill works merely because a rule exists. Owner records `ACCEPT / CHANGES_REQUESTED / DEFER` **separately for each Skill**.

### Solution Architect — APP-wide design quality (SA-Q)
| ID | Criterion |
| --- | --- |
| SA-Q1 | Explicit decisions/trade-offs with **concrete technology stack, frameworks, integration/database/runtime versions and compatibility**; avoids arbitrary new infra |
| SA-Q2 | Whole-APP component boundary, responsibility, source-of-truth/data ownership, API/integration/security and failure flows |
| SA-Q3 | High-level **application code/module layout**, dependency direction, repository/package structure, reuse strategy |
| SA-Q4 | Diagrams (system, technical and applicable deployment/data) accurately correspond to structured specs, have real render evidence and pinned diagram-design execution when required |
| SA-Q5 | NFRs, privacy/security, backup/migration/rollback and disputed decisions/ADRs with Owner decision points |

### Module Architect — code-design implementability (MA-Q)
| ID | Criterion |
| --- | --- |
| MA-Q1 | Exact Owner-approved SYSTEM baseline revision and demonstrated **no silent stack/boundary change** |
| MA-Q2 | A concrete affected **package/file/class/interface map** with distinct responsibilities and direction of dependencies; actionable for Coder |
| MA-Q3 | Versioned API/DB/typed internal contracts, errors, transactional/idempotency/permission rules for the module |
| MA-Q4 | Module component/sequence/workflow and schema diagrams correspond to actual authoritative source and can be rendered; no false diagram-design proof |
| MA-Q5 | Test seams, negative cases, security, migration/risk and clear coder handoff with no unauthorized production implementation |

### UI/UX Designer — consistency and interaction quality (UI-Q)
| ID | Criterion |
| --- | --- |
| UI-Q1 | Clear **project-specific design philosophy**, target user journeys/information architecture and rationale, not generic UI decoration |
| UI-Q2 | Exact **Project UI Profile** revision; tokens, component reuse, layout/nav, typography/density and documented exceptions |
| UI-Q3 | Representative UI **concepts and high-fidelity source** at required L1/L2; responsive, loading/empty/error/permission/success states |
| UI-Q4 | Where L3 selected: genuinely clickable **interactive prototype** with URL/source/startup, working state transitions and real interaction test evidence; static image is not L3 |
| UI-Q5 | Accessible inputs/focus/keyboard/contrast, realistic product workflows, UI ↔ approved API/data/error behavior, consistency across screens |

## Owner evaluation sheet (one per independent execution)
Record: `evaluation_id`, `context_id`, `dispatch_id`, actual `execution_id`, `skill_role`, Skill source path@SHA, artifact manifest/ref@SHA, reviewer/Owner identity, scores for every applicable ID, evidence refs and a `decision` for that Skill. Require all applicable **critical** items (SA-Q1–4, MA-Q1–4, UI-Q1–4 as selected level) to score ≥2, no unlabeled missing real tools, no P0/P1, and Owner ACCEPT to state that a **pilot output meets expectations**.

**Skill itself validated?** Label `PILOT_DELIVERY_ACCEPTED` only for that one bounded real session. Broader `SKILL_VALIDATED` needs at least one additional, meaningfully different authorized scenario, clean source-version trace, independent appropriate design review and explicit Owner decision. No automatic global certification based on a single sample or self-evaluation.

## Example comparison scenarios
- **New expense APP:** Solution Architect proposes entire stack/technical/app-code architecture and relevant SVG/HTML diagrams; Owner evaluates SA-Q1–5.
- **Expense import/categorization module under approved stack:** Module Architect defines bill adapters, API ports, package structure, idempotency/category/GPS provenance with tests, with no stack choice; Owner evaluates MA-Q1–5.
- **Expense entry + import review UI:** UI Designer defines project-local UI philosophy/profile, category dropdown, merchant suggestion override, GPS consent, import errors, and an actually working prototype (L3 if Master/Owner select it); Owner evaluates UI-Q1–5.

## Important independence
The Master checks *workflow and dependency eligibility*, not independently signs off technical/UX quality. An Independent Reviewer makes required DESIGN findings for L/XL and high-risk S/M; the **Owner scores specialist quality**. Real UI tool / diagram skill execution must be verified with actual paths/tool/runtime evidence, otherwise mark NOT RUN and fail the relevant critical rubric.
