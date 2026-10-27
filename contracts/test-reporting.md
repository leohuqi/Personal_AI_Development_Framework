# 跨语言测试报告契约

Schema：`padf.test-run/v1`；[JSON Schema](engineering/test-run.schema.json)。项目runner仍为pytest/JUnit/Vitest/Go等已有工具；优先JUnit XML或等价格式薄适配，不提供通用执行引擎。原始报告和实际CI/QA是证据，JSON只是可核验投影，不认证远端执行。

`run_id, context_id, repository, source_revision, dirty_tree_digest, requirements_revision, test_definition_revision, strategy_ref, runner, environment, command, started_at, finished_at, ci_ref, raw_reports, tests, tc_evidence, coverage, diagnostics`构成运行记录。被测实现版本、TC/测试代码版本、需求版本分别固定；未提交实验用实际摘要manifest标明dirty，不冒充已提交SHA。记录命令argv/真实退出码、runner/环境版本、时间、原XML/log/coverage路径及SHA256；CI/源码链接绑定准确版本。

| 状态 | 含义 |
| --- | --- |
| PASS | 实际断言运行通过，有当前证据 |
| FAIL | 实际断言或runner执行失败，保留差异/日志 |
| SKIPPED | runner明确跳过，不能计为已执行/通过 |
| BLOCKED | 必要环境、输入或依赖缺失，未证明目标行为 |
| NOT_RUN | 尚未运行/范围未执行，写明原因 |

每个结果含唯一`result_id, selector, tc_ids, types, layer, status, attempt, assertion_ids, evidence_refs, details`。参数化保留完整身份；重复导入/重复ID报错，重试不擦掉首失败。JUnit的failure/error映射FAIL，skipped映射SKIPPED；未映射case仅保留报告局部事实，不能猜TC。XML空/坏/计数矛盾/资源超限/实体与DTD声明不得生成空绿结果。runner非0即使无failure case也必须显式报告失败。

`tc_evidence`是本次实际完整性事实：`tc_id, scope, preconditions_verified, steps_verified, assertion_ids, evidence_refs`。FULL不能仅凭一条JUnit PASS产生；必须含完整必要步骤/断言及有效引用，QA/Reviewer仍检查实际语义。缺项/PARTIAL保留技术通过事实，但不计完整AC通过。

## 摘要必须保留的内容

- 唯一结果数量与五状态数量；关系边、TC数、执行次数分开。
- code coverage的line与branch各自`tool/version/covered/total/include/exclude/source_revision/raw_ref`，含应纳入零命中模块；不同工具/口径不平均百分比。AC覆盖用当前批准AC为独立分母。
- TC→测试函数→Run/结果，以及Feature/AC/设计/实现来源；三版本、策略和环境不一致明确诊断，不能用历史CI替当前结果。
- 直达原TC、源码、逐项结果/失败详情、日志、coverage与CI；HTML转义内容，拒绝危险链接。原详细artifact保留，摘要不能替代原件。
- 已知失败、阻塞、未测、过期/部分证据和剩余风险/必要Owner决定。Designed、Automated、Executed、Passed、AC verified、Owner accepted分别陈述；工具不输出自动ACCEPTED/DONE。

## CLI边界与CI失败传播

[报告CLI](../scripts/engineering-report.mjs)使用显式manifest和精确selector映射；仅消费受控报告目录，拒绝越界/symlink、超限输入、未知参数、已有输出覆盖及XML实体。固定Python标准库桥读取XML，不执行项目提供的命令。纯函数、manifest/目标形状和失败优先级见[精确设计§8](../docs/enhancements/engineering/DESIGN.md#83-最小公共函数与cli)；实际可运行命令见[示例](../examples/engineering/README.md)。

退出0表示本命令数据有效且无已知失败，不表示功能完成；1表示已知runner/test失败或BLOCKED；2表示解析/契约/版本/路径错误。SKIPPED/NOT_RUN依然明确不充分。CI先保留原runner状态，再以`if: always()`尽量归档日志和报告；不得`|| true`、continue-on-error或上传成功覆盖真实失败。已有报告工具只需映射语义，不必部署统一服务。
