# AI-SDF V0.3 Development Candidate — Core Workflow (includes V0.2)


2–3 人协作先看[小团队协作](small-team-collaboration.md)：技术成员可兼职责，Master 用最小任务/交接协调；人工评审先给短建议，详细证据按需展开。下面的质量和授权门禁继续适用，不为普通任务重复完整角色流程。

当前成果标准见[角色主成果](../contracts/role-deliverables.md)与[共用工作方法](role-work-method.md)。Master 对内容充分性、整体一致性和整合建议负责，独立 Reviewer 和 Owner 权限不变。PA先出High Level Specs/Catalog，SA评复杂度、Master规划，Module结合SA与已确认UI细化实施级Spec并Handoff；UI按概念→Figma确认→获授权前端高保真。消息、执行和交接按[共用协议](agent-protocol.md)按需读取，主成果在前、审计为附录，简单增量不重复完整试点。

**Specification, not an engine.** This workflow is human-initiated with hosted GitHub Actions and separately configured Codex review; it does not run continuously.

## Actors
**Owner** makes product, UX, architecture, acceptance and production decisions. **Master** refines, plans, verifies readiness, delegates approved bounded tasks and reconciles QA/review evidence. **Coder** implements and tests. **QA Tester** independently verifies cases. **Independent Reviewer** checks the exact PR diff and risk. **Linear** tracks project/Cycle/issues, **GitHub** stores authoritative code/specs/PR/CI.

## State machine
| Linear state | Meaning for new work | Gate |
| --- | --- | --- |
| Backlog | Not yet ready / deferred / blocked | Feature scope and blockers documented |
| Todo | Ready | Definition of Ready + owner authorization |
| In Progress | Coding | Authorized Task Contract, dedicated branch |
| In Review | CI, QA, independent review, owner acceptance pending | PR at exact SHA, test evidence, findings |
| Done | Accepted | Owner decision and Delivery Report |
| Canceled / Duplicate | Not proceeding | Reason and links |

Imported historical Done may signify implementation archival only. Preserve the consuming project's legacy status semantics.

## Feature Loop — explicitly started
1. Owner/Master classify S bug, M feature, L cross-module or XL product. Reconcile PRD/UI/Architecture/Feature Spec with Linear ID and original Feature ID.
2. **Definition of Ready:** unambiguous scope and exclusions, approved Feature Spec/source SHA, resolved dependencies, design decisions/UX baseline, testable acceptance criteria, required tests and explicit approval.
3. Master resolves [Shared Task Context](../contracts/shared-task-context.md) and pending messages, then creates [Task Contract](../contracts/task-contract.md) with context refs; owner starts Codex on the approved bounded task. Linear Free **does not automatically dispatch**.
4. Coder verifies current source SHA and messages, implements the minimal vertical slice, unit tests and relevant docs, opens GitHub PR including both IDs, and issues a verifiable Agent Handoff to QA/review; no production deployment.
5. GitHub Actions runs project CI on PR; QA verifies acceptance with PASS/FAIL/BLOCKED/NOT RUN; Reviewer separately examines exact base-to-head diff, risk and evidence.
6. Failing QA/CI/review returns to bounded rework, then retest and re-review new SHA; P0/P1 block merge/acceptance, P2 needs fix or explicit Owner-approved conditions, P3 tracked.
7. Master reconciles agent messages, checkpoints, handoffs, evidence and remaining risks. Only applicable Owner approval permits newly developed Issue Done. PR merge ≠ deployment or business acceptance.

## Iteration Loop — owner initiated
Select small vertical, independently usable MVP slices; plan current 1–2 Cycles in detail, further Roadmap coarsely. Track dependencies, UI/API/data/test work and integration criteria. At Cycle end review integrated behavior, test coverage, remaining technical debt and feedback-based Bug/CR. Default separate integration review every **3–5 merged feature PRs (no later than fifth)** and at significant milestones / pre-release; project policy may be stricter.

## Failure and security gates
Stop on ambiguous specs, missing prerequisites, unapproved architecture changes or blocked dependencies; never invent product behavior. A green CI or self-review does not constitute independent approval. Reviewer must use fresh context for significant changes; re-review altered head. Missing evidence is NOT RUN, not PASS. Destructive migrations, production deployments, credential changes and deletion always require separate explicit authorization. No unbounded automatic retry or hidden background monitoring.

## V0.2 Context & Agent Communication gates
This section is binding in addition to all existing DoR, Owner authorization, review and safety gates. See [CACF workflow](context-communication.md), [context governance](../governance/context-governance.md) and [Context Coordinator Skill](../.agents/skills/context-coordinator/SKILL.md).

1. **Context Readiness**: Master validates approved Feature Spec/revision, Task Contract, code baseline, original Feature ID, Linear issue/dependencies, authorized scope and unresolved critical message threads. Do not dispatch until DoR/approval are satisfied.
2. **Agent start/dispatch**: Every agent loads only role-relevant source sections and pending messages from the task's Shared Task Context. Verify live revisions/status; a checkpoint alone is not authorization.
3. **Collaboration**: Persist cross-role decisions, blockers and actionable questions in durable Linear issue comments or PR reviews using the [Agent Message](../contracts/agent-message.md) envelope. Direct messages within one runtime are optional and not inherently durable.
4. **Checkpoint/handoff**: At planned session/role boundaries publish a [Checkpoint](../contracts/context-checkpoint.md) or [Agent Handoff](../contracts/agent-handoff.md) with exact revision, evidence, open messages, next role and stop conditions. Verify recipient ACK after actual retrieval; message creation does not start the recipient.
5. **Resume reconciliation**: New session reads live Git HEAD, relevant approved specs/ADRs, Linear state/dependencies and outstanding messages. On version drift/authorization gaps, stop and escalate; do not clobber other agents' work.
6. **Review independence**: QA and Reviewer verify against exact artifact SHA. Never treat Coder transcript/self-review as independent evidence. A new head requires affected revalidation.
7. **Finalize**: Master links final Delivery Report, ensures approved decisions are reflected in canonical docs, closes resolved messages, tracks deferred work and requests Owner acceptance.

V0.2 does **not** implement a long-running orchestrator, automatic notifications, background agents, self-triggered tasks, Redis, a new database, or an A2A server. Human/authorized runtime invocation remains required.

## V0.3 specialized design stages (candidate)
1. Master classifies S/M/L/XL, impacted capabilities/risk and **architecture_scope (none/system/module/both)**. Route system-level Solution Architect for new APP/major baseline changes, Module Architect for a detailed module under approved baseline, and UI Designer as needed. See [design collaboration](design-collaboration.md).
2. Solution Architect defines technology stack and APP-wide module/code architecture when SYSTEM required; Module Architect designs module packages, interfaces and code structure linked to the approved system baseline when MODULE required. Both scopes require ordered SYSTEM -> MODULE and version matching. Each produces required checked structured designs/diagrams; UI Designer builds concepts/prototypes under a pinned project UI Profile. Each producer independently validates **its own** work, then sends a V0.2 Handoff.
3. Master verifies [stage and artifact dependencies](../contracts/agent-dependency.md) including source revision, exact link, stale status and N/A/waiver rationale.
4. **Mandatory independent DESIGN review** for L/XL or high-risk S/M (security, permissions, risky schema/migration, breaking API, critical rules/workflow, shared UI/component etc.). Ordinary S/M gets a documented risk-based review decision.
5. Master operates the [Design Gate](../contracts/design-gate.md). Independent Reviewer judges quality and versioned evidence, not approvals or job dispatch. Design READY does not grant coding authorization.
6. Owner records material design decisions and separately authorizes bounded coding. Coder/QA/Implementation Reviewer follow unchanged V0.2 quality gates and immutable PR SHA.
7. This is **declarative sequential coordination** with a pure optional evaluator, not a new runtime or parallel Coder orchestrator.


## V0.3 real Master Orchestration validation sequence (non-runtime)
For the bounded cross-session pilot, use [Master Orchestration Runbook](master-orchestration-validation.md):
1. Master derives routing **without Owner specifying specialist micro-tasks**, persists each actual [Dispatch](../contracts/agent-dispatch.md) before execution.
2. Master 优先调用现成真实运行时并记录工具 task ID（`RUNTIME_DISPATCH`）；已批准范围内复用有效授权，无需逐次批准。缺少能力时 Owner 仅凭分派链接启动独立会话（`HUMAN_RELAY`）。启动前核对当前范围、必要决策批准与依赖；消息本身不启动 Agent。见[审批策略](../governance/approval-policy.md)。
3. Receiving Agent records real execution receipt and publishes its own artifact/Handoff. Master fetches Handoff and independently reconciles live dependency versions and approvals **before** next dispatch; blocked/unapproved baseline means stop or clearly conditional draft.
4. After Solution Architect, Module Architect, UI Designer, Owner scores each package separately per [Quality Evaluation](../contracts/skill-delivery-evaluation.md); independent DESIGN Reviewer remains mandatory for L/XL.
5. Existing [design gate](../contracts/design-gate.md) and Owner coding authorization are separate. **One-session role play never passes actual Master Orchestration.** No background automation added.

## G-01 主动操作门禁

Owner Request → [Master Preflight](action-preflight.md) → Readiness → Authorized Action → Evidence Reconciliation。所有保留操作前按实时来源评估、调用前再核验并匹配HEAD，不能Owner说合并就跳过必需Review。准确Owner接受与Issue Done分开，Merge触发Done时识别异常并在获授权范围补偿；未验证集成设置不声称已关闭。v0.3.2分派继续复用有效批准。
