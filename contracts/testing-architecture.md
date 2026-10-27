# 测试架构与质量策略契约

Schema：`padf.testing-architecture/v1`；[JSON Schema](engineering/testing-architecture.schema.json)。SA负责选型/边界，批准沿用原系统方案政策；不创建单独测试架构批准门禁。字段存在或validator PASS不能认证批准。

新系统/测试技术架构变化时，使用[模板](../templates/testing-architecture.md)在系统主方案中明确以下十项；未变的批准策略固定引用即可，不要求每个Feature重写。

| 内容 | 最小可实施信息 |
| --- | --- |
| 框架选择 | 项目语言/运行时、框架版本/依据及维护成本，现实替代与选择理由 |
| 测试范围 | 当前测试对象、Functional/Non-functional类型与适用层级 |
| 层级边界 | Unit/Component/API/Integration/E2E分别证明什么及不证明什么 |
| 依赖与隔离 | mock边界、fixture、必要真实数据库/文件/消息依赖和隔离/清理 |
| 数据与隐私 | 合成或脱敏数据、访问/保留限制，不将密钥或生产个人数据放报告 |
| 本地命令 | 固定工具/版本和可复现命令；本契约只记录不执行命令 |
| CI | 环境/触发、必要步骤、失败传播及always保留artifact |
| Coverage | line/branch工具与include/exclude/分母、风险理由；AC指标独立 |
| 报告 | Run/环境/三版本、JUnit或等价adapter、原始结果/日志/coverage入口 |
| TDD | 当前适用行为、RED/GREEN证据及不适用理由/等效策略 |

结构含`strategy_id, context_id, project, source_ref, status, approval_ref, stack, profile, test_types, test_layers, boundaries, commands, ci_ref, coverage_policy, reporting, tdd_scope, data_privacy`。`status=PROPOSED`不代表获批；`APPROVED`必须引用实际批准，同一策略/版本供Coder、QA、报告消费。Engineering `profile`与架构Profile独立。技术栈自主选择示例见[共享标准](../standards/engineering/README.md#分类与测试架构)，不新增统一runner或依赖清单。

实现纯只读校验见[engineering模块](../lib/engineering.mjs)。测试结论、格式与精确证据见[报告契约](test-reporting.md)；系统基线与Owner授权仍遵循原契约。
