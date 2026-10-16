# Personal AI Development Framework (PADF / AI-SDF)

**V0.3 development candidate (Draft PR, not yet released)** — separate system-wide Solution Architect and module-level Module Architect, plus UI/UX Skills with task-dependent Design Gate; retains the stable V0.2 context/communication foundation.

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

## V0.2 — Context & Agent Communication (CACF)

Cross-session ChatGPT/Work/Codex continuity and multi-agent collaboration use a **Shared Task Context**, typed durable **Agent Messages**, **Context Checkpoints**, and verifiable **Agent Handoffs**. GitHub remains authoritative for code/approved specs/ADRs, Linear for live task state and dependencies, and Owner approval for protected decisions. A message/checkpoint does not grant authorization, wake another agent, or certify test results.

- [Context & communication workflow](workflow/context-communication.md)
- [Shared Task Context contract](contracts/shared-task-context.md)
- [Agent Message contract](contracts/agent-message.md)
- [Context Checkpoint & Resume contract](contracts/context-checkpoint.md)
- [Agent Handoff contract](contracts/agent-handoff.md)
- [Context governance](governance/context-governance.md)
- [PQA example walkthrough](examples/pqa/CONTEXT-COLLABORATION.md)

**Scope boundary:** V0.2 supplies Skills, message contracts, and human/runtime-initiated workflows—not an A2A server, message broker, continuous scheduler, new database, automated agent dispatch or live notification service. Integration and actual agent delivery still depend on the connected tools and approved task execution.

## V0.3 — Specialized Design Agents (development candidate)

The V0.3 extension distinguishes a [Solution Architect](.agents/skills/solution-architect/SKILL.md) for whole-app stack and baseline decisions from a [Module Architect](.agents/skills/module-architect/SKILL.md) for detailed module code/package/interface design under the approved system architecture. Both specialist Architects use the **pinned external** [diagram-design](integrations/diagram-design.md) skill to produce architecture, workflow and database schema visualizations with versioned authoritative source models. A [UI/UX Designer](.agents/skills/ui-ux-designer/SKILL.md) outputs design philosophy, UI concept, high-fidelity and risk-appropriate interactive prototypes, all traced to each project's [UI Profile](contracts/project-ui-profile.md).

Master performs [capability-based routing](workflow/agent-routing.md), checks [agent-stage dependencies](contracts/agent-dependency.md) and operates a [Design Gate](contracts/design-gate.md). **Governance model C**: L/XL and risk-triggered S/M require independent DESIGN review; Master controls process/readiness, Reviewer assesses design quality and Owner approves material decisions and coding. Designers produce [existing V0.2 handoffs](contracts/agent-handoff.md); recipients ACK/NEEDS_REFINEMENT. No parallel Coder scheduler or agent daemon.

- [Sequential design workflow](workflow/design-collaboration.md) · [System architecture baseline](contracts/solution-architecture.md) · [Module design](contracts/module-design.md) · [Architecture package selector](contracts/architecture-design.md) · [UI package](contracts/ui-design.md)
- [Pinned diagram-design integration](integrations/diagram-design.md) · [Dependency/gate evaluator](lib/design-gate.mjs)
- Validation: `node tests/v0.3/run-tests.mjs` (fixture checks, not real diagram/prototype generation).

**Status: V0.3 is proposed for Owner review and testing, not merged/released.** Projects remain on immutable [PADF v0.2.0](https://github.com/leohuqi/Personal_AI_Development_Framework/releases/tag/v0.2.0) until separately approved.

## Core Skills

| Skill | Responsibility |
| --- | --- |
| [master-orchestrator](.agents/skills/master-orchestrator/SKILL.md) | Scope, design coordination, task readiness, conflict routing and acceptance |
| [context-coordinator](.agents/skills/context-coordinator/SKILL.md) | Minimal shared context, durable messages, checkpoint/resume and cross-agent handoff |
| [solution-architect](.agents/skills/solution-architect/SKILL.md) | APP-wide technology stack, solution architecture, high-level application module layout, ADR and diagrams |
| [module-architect](.agents/skills/module-architect/SKILL.md) | Approved-baseline-conformant module code/package design, interfaces, internal flows and tests |
| [ui-ux-designer](.agents/skills/ui-ux-designer/SKILL.md) | Project-specific consistent UI concepts, prototypes and interaction contracts |
| [feature-coder](.agents/skills/feature-coder/SKILL.md) | Authorized implementation and PR handoff |
| [qa-tester](.agents/skills/qa-tester/SKILL.md) | Test design, integration/E2E verification, evidence |
| [independent-reviewer](.agents/skills/independent-reviewer/SKILL.md) | Fresh-context review of exact PR diff and risks |

- [Workflow and quality gates](workflow/WORKFLOW.md)
- [Task Contract](contracts/task-contract.md) and [Delivery Report](contracts/delivery-report.md)
- [Authorization policy](governance/approval-policy.md) and [context loading](governance/context-loading.md)
- [Agent routing](workflow/agent-routing.md)
- [Pull request template](templates/pull_request_template.md)
- [PQA adoption example](examples/pqa/ADOPTION.md)

## Validation

Run the dependency-free CACF structural checker after cloning PADF:

    node scripts/validate-cacf.mjs
    node tests/v0.3/run-tests.mjs

It verifies required files, local Markdown links, schema markers and role integration. It does **not** exercise live Linear/GitHub message delivery, automatic agent dispatch, external integrations or actual multi-session recovery; validate those manually in an authorized pilot.

## Project adoption

1. Review and approve an exact PADF commit/tag.
2. Copy or pin the approved `.agents/skills/` Skill files into the consuming repository, or make them accessible to the supported agent environment.
3. Keep `AGENTS.md` small and project-specific. Read only relevant Feature Specs and technical contract sections.
4. Configure Linear/GitHub integration, GitHub Actions and Codex Automatic Review **separately**. Committing Skills does not enable those products.
5. Use a Task Contract on every approved development task, a Shared Task Context for source/message references, and a Delivery Report for QA/review evidence and owner acceptance.
6. Record meaningful cross-agent questions/results as typed messages with permalinks; checkpoint before session/agent boundaries and verify live sources when resuming.
7. Skills are not a Loop Engine: Linear Free does not continuously dispatch Codex jobs. No self-hosted server is required for this workflow.

## Review before integration

This repository is the framework review target. [PQA Draft PR #7](https://github.com/leohuqi/Personal_Quant_Analyst/pull/7) stays **open, unchanged and unmerged** until PADF has been reviewed and explicitly approved. PADF commits do not modify PQA or its production environment.

**Future specialized Skills (not included in V0.3):** Product Analyst, Feature Planner/Designer, Iteration Manager and any parallel execution runtime.
