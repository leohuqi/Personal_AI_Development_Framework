# Owner-facing Specialist Skill Delivery Quality Evaluation — PADF V0.3

Schema: `padf.skill-delivery-evaluation/v1`.

**Two independent questions must be answered:** (A) Did the Master coordinate **real independent specialist executions** via a valid [Dispatch chain](agent-dispatch.md)? (B) Are the actual design deliverables of each Skill useful and correct? A PASS on A never implies B; a polished diagram never proves A.

## Quality dimensions and scoring
For each named mandatory criterion record `0 = MISSING`, `1 = INADEQUATE`, `2 = ACCEPTABLE`, `3 = STRONG`, or `N/A` with **specific applicability rationale**. Provide artifact permalink **at immutable SHA**, one concrete strength/problem per criterion and verified test/render evidence. Missing files/links or unverifiable "interactive" claims receive 0 / NOT RUN; do not infer a professional skill works merely because a rule exists. Owner records `ACCEPT / CHANGES_REQUESTED / DEFER` **separately for each Skill**.

### Product Analyst — 产品定义与功能行为（PA-Q）

| ID | Criterion |
| --- | --- |
| PA-Q1 | 问题、用户/典型场景、成功标准、重要约束明确；区分事实、推断和假设 |
| PA-Q2 | 研究服务真实任务和决策，比较相关方案并形成适用性/取舍结论；复用共享证据，不把资料阅读称用户实测 |
| PA-Q3 | 产品旅程、功能关系、优先级和版本切片能解释用户价值；Catalog 链接详细定义 |
| PA-Q4 | 本阶段 Feature Specs 明确输入输出/数据、正常与异常、规则状态、修改/撤销/确认/拒绝及验收，足以支持设计 |
| PA-Q5 | 具体待决问题、适用批准、范围/排除项、依赖和下游交接，不替 Owner 决策或把缺口留给模块 |

### Solution Architect — APP-wide design quality (SA-Q)
| ID | Criterion |
| --- | --- |
| SA-Q1 | Explicit decisions/trade-offs with **concrete technology stack, frameworks, integration/database/runtime versions and compatibility**; avoids arbitrary new infra |
| SA-Q2 | 连贯系统主方案说明模块职责/依赖、公共接口、数据归属/一致性、跨模块正常与失败运行流程，不能仅给目录或图 |
| SA-Q3 | High-level **application code/module layout**, dependency direction, repository/package structure, reuse strategy |
| SA-Q4 | Diagrams (system, technical and applicable deployment/data) accurately correspond to structured specs, have real render evidence and pinned diagram-design execution when required |
| SA-Q5 | 明确规模/质量目标及部署、安全、性能/容量、可观测性、备份恢复、分阶段兼容/迁移/演进和待决取舍 |

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
| UI-Q1 | 产品任务与体验研究有证据分类；信息架构/流程可解释任务完成和理解负担；方向不明先比较真实差异概念并收反馈，明确局部变化复用 |
| UI-Q2 | Exact **Project UI Profile** revision; tokens, component reuse, layout/nav, typography/density and documented exceptions |
| UI-Q3 | 所选 L1/L2 的代表性概念/源和取舍、方向反馈及适用响应式/异常状态；不以页面、token 或热点数量代替任务质量 |
| UI-Q4 | Where L3 selected: genuinely clickable **interactive prototype** with URL/source/startup, working state transitions and real interaction test evidence; static image is not L3 |
| UI-Q5 | Accessible inputs/focus/keyboard/contrast, realistic product workflows, UI ↔ approved API/data/error behavior, consistency across screens |

## Owner evaluation sheet (one per independent execution)
Record: `evaluation_id`, `context_id`, `dispatch_id`, actual `execution_id`, `skill_role`, Skill source path@SHA, artifact manifest/ref@SHA, reviewer/Owner identity, scores for every applicable ID, evidence refs and a `decision` for that Skill. Require all applicable **critical** items (PA-Q1–4, SA-Q1–4, MA-Q1–4, UI-Q1–4 as selected level) to score ≥2, no unlabeled missing real tools, no P0/P1, and Owner ACCEPT to state that a **pilot output meets expectations**.

**Skill itself validated?** Label `PILOT_DELIVERY_ACCEPTED` only for that one bounded real session. Broader `SKILL_VALIDATED` needs at least one additional, meaningfully different authorized scenario, clean source-version trace, independent appropriate design review and explicit Owner decision. No automatic global certification based on a single sample or self-evaluation.

## Example comparison scenarios
- **New expense APP:** Solution Architect proposes entire stack/technical/app-code architecture and relevant SVG/HTML diagrams; Owner evaluates SA-Q1–5.
- **Expense import/categorization module under approved stack:** Module Architect defines bill adapters, API ports, package structure, idempotency/category/GPS provenance with tests, with no stack choice; Owner evaluates MA-Q1–5.
- **Expense entry + import review UI:** UI Designer defines project-local UI philosophy/profile, category dropdown, merchant suggestion override, GPS consent, import errors, and an actually working prototype (L3 if Master/Owner select it); Owner evaluates UI-Q1–5.

## Important independence
Master 对内容充分性、整体一致性、整合建议及流程/依赖负责，可要求范围内返工；这不等于独立签署技术/UX 审查或代 Owner 批准。 An Independent Reviewer makes required DESIGN findings for L/XL and high-risk S/M; the **Owner scores specialist quality**. Real UI tool / diagram skill execution must be verified with actual paths/tool/runtime evidence, otherwise mark NOT RUN and fail the relevant critical rubric.
