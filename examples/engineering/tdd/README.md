# 代表性实际 RED / GREEN 原件

这些文件来自ENG-CODE-01本轮真实开发执行，Master原样归档开发者保留的日志/阶段摘要，不是对历史项目补造TDD。当前最终实现重跑只能证明当前GREEN；原始运行事实及执行者Handoff见[PR #30](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/30)。阶段文件是有意缺行为的测试原件，不能作为产品实现导入。

| 范围 | 实际RED与原件 | 后续GREEN |
| --- | --- | --- |
| 报告语义 | [行为断言失败](node-red.log)，[当时实现/测试摘要](node-red.sha256)；Unit局部证据不能报告完整AC，实际`1 !== 0` | [结果](node-green.log)及[摘要](node-green.sha256)；后续公开测试继续增量，不把最终测试文件冒充首轮原件 |
| Python SQLite | [原缺陷实现](python-red-store.py)、[当时测试副本](python-red-test_store.py)、[运行失败](python-red.log)、[原阶段摘要](python-red.sha256)；3 FAIL/5 PASS，涉及跨owner和事务回滚 | [8 PASS](python-green.log)、[阶段摘要](python-green.sha256)；当前源码见上级Python目录 |
| Java 文件系统 | [原缺行为实现](RecordStore-red.java)、[实际失败](java-red.log)、[阶段摘要](java-red.sha256)；2 FAIL/1 PASS | [3 PASS](java-green.log)、[阶段摘要](java-green.sha256)；当前源码见上级Java目录 |

Python测试副本与原RED摘要中的`d1008d7c…`一致。日志中断言/异常应与预期缺行为对应，导入/环境失败不能冒称RED。独立QA还以自己的SQLite探针击穿weakfix，再对正确实现重跑；其当前精确版本结果与原件在PR/CI证据中另列，不以Coder原件替独立验证。
