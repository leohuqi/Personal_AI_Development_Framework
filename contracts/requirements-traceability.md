# 需求与测试追溯

Schema：`padf.traceability/v1`；[JSON Schema](engineering/traceability.schema.json)。仅关联已有权威对象，不重建Requirements Discovery或测试管理系统。方法见[工程标准](../standards/engineering/README.md#追溯与报告)。

- `trace_id, context_id, requirements_revision, test_definition_revision`固定本次关系集和定义版本。
- `requirements[]`引用稳定`id, feature_ids, kind(requirement/ac), approval(candidate/approved), approval_ref, source_ref, required_tc_ids`；批准AC完整分母按唯一AC计算，候选独立展示，禁止据测试PASS推导批准。
- `test_cases[]`含`id, source_ref, types[], layer, selector?, required_assertions[], preconditions_ref, steps_ref`；步骤/正文留原TC。Functional是类型，层级独立。自动化selector须完整精确，不用名称子串猜测。
- `nodes[]`仅design/implementation固定源引用；节点与需求/TC的ID全局唯一。`links[]`含唯一`id, from, to, relation, evidence_scope(NONE/PARTIAL/FULL), required_assertion_ids`。方向为refines：需求→设计；implements：设计或需求→实现；tests：TC→需求/设计/实现；引用不存在或反向均为错误。Feature沿用Catalog ID，不在此复制Catalog。

多对多关系不重复计数实际执行。同一技术测试可给多AC提供PARTIAL证据，但完整AC需全部必需TC/断言、前置/步骤及有效FULL证据。空必需TC不自动全通过；没有当前批准AC的分母显示N/A，而非100%。不要求每个Unit手工维护全链，可用现有代码元数据/现有CI生成关联，语义仍由QA/Reviewer核验。

Run按[报告契约](test-reporting.md)分别固定实现、需求和测试定义版本及策略/环境；旧结果可读但不进入当前覆盖分子，不能跨不兼容环境凑齐通过。设计覆盖、自动化覆盖、执行覆盖、局部通过、完整AC验证分别展示，不推导Owner验收。原有稳定ID、Schema、批准状态、历史结果不得为接入本契约自动改名。
