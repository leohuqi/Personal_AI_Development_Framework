# Personal AI Development Framework (PADF / AI-SDF)

**V0.1 — canonical reusable AI software development Skills, contracts and workflow.**

PADF defines owner-governed, agent-executed incremental software development. Each application maintains its **own PRD, Architecture, UX baseline, Feature Catalog, source code, AGENTS.md and CI**. PADF is shared across all projects, not a PQA feature branch.

## Core workflow

```text
Product Owner ↔ ChatGPT/Work Master Agent
   ↓ approved PRD / Feature Spec / UI & architecture
Linear Free: Roadmap, issue, priority, blockers, Cycle
   ↓ explicit owner-authorized Codex task (no autonomous loop)
Feature Coder → GitHub PR → GitHub Actions + QA Tester
                                    ↘ Independent Code Reviewer
                                    ↘ rework if failed
   ↓ evidence + applicable owner acceptance
Linear Done / next manually authorized Feature
```

## Core Skills

| Skill | Responsibility |
| --- | --- |
| [master-orchestrator](.agents/skills/master-orchestrator/SKILL.md) | Scope, design coordination, task readiness and acceptance |
| [feature-coder](.agents/skills/feature-coder/SKILL.md) | Authorized implementation and PR handoff |
| [qa-tester](.agents/skills/qa-tester/SKILL.md) | Test design, integration/E2E verification, evidence |
| [independent-reviewer](.agents/skills/independent-reviewer/SKILL.md) | Fresh-context review of exact PR diff and risks |

- [Workflow and quality gates](workflow/WORKFLOW.md)
- [Task Contract](contracts/task-contract.md) and [Delivery Report](contracts/delivery-report.md)
- [Authorization policy](governance/approval-policy.md) and [context loading](governance/context-loading.md)
- [Agent routing](workflow/agent-routing.md)
- [Pull request template](templates/pull_request_template.md)
- [PQA adoption example](examples/pqa/ADOPTION.md)

## Project adoption

1. Review and approve an exact PADF commit/tag.
2. Copy or pin the approved `.agents/skills/` Skill files into the consuming repository, or make them accessible to the supported agent environment.
3. Keep `AGENTS.md` small and project-specific. Read only relevant Feature Specs and technical contract sections.
4. Configure Linear/GitHub integration, GitHub Actions and Codex Automatic Review **separately**. Committing Skills does not enable those products.
5. Use a Task Contract on every approved development task, and a Delivery Report for QA/review evidence and owner acceptance.
6. Skills are not a Loop Engine: Linear Free does not continuously dispatch Codex jobs. No self-hosted server is required for this workflow.

## Review before integration

This repository is the framework review target. [PQA Draft PR #7](https://github.com/leohuqi/Personal_Quant_Analyst/pull/7) stays **open, unchanged and unmerged** until PADF has been reviewed and explicitly approved. PADF commits do not modify PQA or its production environment.

**Future specialized Skills (not yet implemented):** Product Analyst, UI/UX Designer, Solution Architect, Feature Planner/Designer and Iteration Manager.
