# Test Results：<Run ID / 日期>

责任：QA Tester。固定被测commit/build、用例集版本、环境/浏览器/依赖版本、数据/fixture边界、执行者与时间、工具/CI链接。复用项目现有报告可保留字段映射。

| Run ID / TC-ID / 精确selector | 测试定义/代码版本及需求版本 | 被测commit/build/dirty摘要 | 预期引用 | 实际结果/关键值 | PASS / FAIL / SKIPPED / BLOCKED / NOT_RUN | 日志/原报告/命令退出码/CI证据 | 缺陷ID及复现 | FULL/PARTIAL及限制/未测原因 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

汇总各状态数量、核心AC覆盖、未测/阻塞和剩余风险，给出真实结论。PASS必须有实际运行结果/证据；FAIL附可复现差异；BLOCKED写前置缺口；NOT RUN写原因。CI观察和自己复现分开列，截图/mock不能替代适用的集成行为。

新SHA重测受影响项并增加Run，保留旧结果。只复用未变证据时明确原SHA/适用理由，不将旧PASS冒称新运行。QA通过不代Owner验收、独立Review或合并/部署批准。

按[报告契约](../contracts/test-reporting.md)记录runner版本、开始/结束、策略/环境和原报告摘要；SKIPPED为明确跳过，不计执行/通过。汇总唯一结果五状态，不用多对多边数重复计数；line/branch各自分母与批准AC覆盖分别报告。Designed/Automated/Executed/Passed/AC充分验证/Owner验收独立，Unit绿而Functional未运行仍显式缺口。报告链接直达TC、源码、逐项结果、失败/日志、Coverage、CI；失败也保留诊断，不隐藏runner失败。
