# Test Results：<Run ID / 日期>

责任：QA Tester。固定被测commit/build、用例集版本、环境/浏览器/依赖版本、数据/fixture边界、执行者与时间、工具/CI链接。复用项目现有报告可保留字段映射。

| Run ID / TC-ID | 用例版本 | 被测commit/build | 预期引用 | 实际结果/关键值 | PASS / FAIL / BLOCKED / NOT RUN | 日志/截图/命令/CI证据 | 缺陷ID及复现 | 限制/未测原因 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

汇总各状态数量、核心AC覆盖、未测/阻塞和剩余风险，给出真实结论。PASS必须有实际运行结果/证据；FAIL附可复现差异；BLOCKED写前置缺口；NOT RUN写原因。CI观察和自己复现分开列，截图/mock不能替代适用的集成行为。

新SHA重测受影响项并增加Run，保留旧结果。只复用未变证据时明确原SHA/适用理由，不将旧PASS冒称新运行。QA通过不代Owner验收、独立Review或合并/部署批准。
