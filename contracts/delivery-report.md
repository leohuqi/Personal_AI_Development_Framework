# Delivery Report — Template

按[文档与评审规则](../workflow/role-work-method.md#文档评审与沟通同样最小充分)用结论或请求开头；需人工决定时可用[阶段短卡片](../templates/stage-delivery.md)。以下是执行者按角色/实际影响维护的证据视图，不是人人每次都填的全表；已存在的测试、交接、设计和批准只引用一次。一个记录可承载多个部分，必要事实和精确版本仍须可核验，未测/未批准不能补成通过。

## Identity
- Linear issue:
- Original Feature ID:
- Agent/role (Coder, QA, Independent Reviewer, Master):
- PR URL; base SHA; head SHA:
- Environment and versions:

## V0.2 context continuity / communication
- context_id and Shared Task Context permalink:
- Task Contract and Owner authorization refs:
- Input checkpoint/handoff IDs and versions (or N/A):
- Outgoing handoff ID, receiver, durable permalink and ACK/NEEDS_REFINEMENT state:
- Resolved message IDs with evidence links:
- Unresolved message IDs, BLOCKER/CHANGE_REQUEST state and responsible role:
- Observed Linear status and timestamp; approved spec revision; current branch/head SHA:
- Reconciliation result for stale checkpoints/spec/HEAD differences:
- Context finalization / open residual task refs:

These entries are observations/links, not evidence of implicit approval, message delivery or agent wake-up.

## V0.3 design and dependency evidence
- Specialist routing: Task class + impacts/risk flags, excluded roles and reason:
- Architecture routing scope (none/system/module/both), Task class/risk rationale, stage-by-stage role Owner:
- Solution Architecture: technology/framework stack, application module/code topology, architecture/ADR baseline SHA and diagrams (or unchanged baseline):
- Module Code Design: concrete packages/classes/interfaces, baseline SHA match, module flows/tests and diagrams (or N/A):
- External diagram-design installation/pinned upstream SHA/render check (PASS/FAIL/BLOCKED/NOT RUN):
- Project UI Profile revision, UI Concept, high-fi and interactive prototype artifacts as applicable:
- UI consistency, accessibility and interaction check evidence:
- Dependency manifest, revision freshness, downstream statuses and blockers:
- Design Handoff links and receiver acknowledgement:
- Independent DESIGN review decision, reviewed artifact SHA and P0–P3 findings (or Master risk-based skip reason):
- Master Design Gate result and Owner material design decision, distinct from bounded coding authorization:

Do not infer that a visual prototype, simulated stage evaluation or designer self-check proves actual implementation.

## Implementation (Coder)
- Approved scope delivered / not delivered:
- Changed paths and affected API/schema/design contracts:
- Migration or backward-compatibility impact:
- Docs updated (or N/A):
- Known risks, technical debt and deferred work:

## Test evidence (QA)
| Acceptance case | Expected | Actual | Status (PASS/FAIL/SKIPPED/BLOCKED/NOT_RUN) | Environment / evidence URL |
| --- | --- | --- | --- | --- |
| AC-1 | | | NOT RUN | |

- Commands run; tool versions:
- GitHub Actions run URL and **observed** conclusion:
- Desktop/mobile Playwright screenshot/report URLs if applicable:
- Project database migration/integration evidence in an isolated environment, if applicable:
- Explicitly skipped/unavailable checks and reasons:
- Defects with reproducible steps / assigned issues:

适用的工程摘要按[报告契约](test-reporting.md)引用一份现有报告：唯一测试数/五状态，line/branch各自分母，批准AC设计/自动化/执行/完整验证及PARTIAL缺口，三版本/环境/策略，原TC、测试源码、逐项结果/失败、Coverage和CI入口。Designed/Automated/Executed/Passed/AC verified与Owner accepted分别报告，Unit全绿不代表Feature验收；候选需求单列。复用已有CI/报告，不手工复制执行结果。适用TDD的代表性RED/GREEN、调试复现/根因/回归与当前完成核验只给准确引用及限项，不给历史代码补造过程。

## Independent Review
- Decision: PENDING / APPROVE / APPROVE WITH CONDITIONS / REQUEST CHANGES; blockers / requested action first.
- Reviewer identity/context independence:
- Exact reviewed PR and base/head SHA:
| Finding | Severity (P0–P3) | File/line | Scenario and impact | Resolution |
| --- | --- | --- | --- | --- |
| (none or evidence) | | | | |
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


## V0.3 separate Master orchestration / Skill delivery quality acceptance
- Master dispatch chain: one row per role with dispatch/ref@SHA, start method (HUMAN_RELAY vs RUNTIME_DISPATCH), actual executor session/task evidence, Handoff link@SHA, time and prior Master dependency reconciliation ref.
- Master orchestration outcome: ROLE_SIMULATION / METADATA_ELIGIBLE_HUMAN_RELAY / METADATA_ELIGIBLE_RUNTIME_DISPATCH / VERIFIED_HUMAN_RELAY / VERIFIED_RUNTIME_DISPATCH / BLOCKED, with **independent external evidence and its limitations**. Never promote metadata-only into verified.
- Quality sheets: SA-Q1–5, MA-Q1–5, UI-Q1–5 from [Owner Evaluation](skill-delivery-evaluation.md), each tied to its Skill/dispatch/execution/artifact SHA, Owner score/evidence/decision.
- Independent design review and Owner coding authorization remain separate. A successful orchestration process does **not** imply good Skill output.

## 适用的文档影响

按[文档标准](../standards/documentation/README.md#每次交付只维护受影响内容)在本交付给出文档中心入口、本次更新的原来源/Feature关联与导航、实际检查/生成结果及未同步项；无影响说明依据，未执行/失败不能写已同步。外部状态带真实观察时间，派生页另记生成时间。只报受影响部分，不复制完整库或重复QA结果。
