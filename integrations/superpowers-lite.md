# Superpowers Lite：采用方法，不增加流程

固定 `obra/superpowers@2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`；[来源与摘要锁](superpowers-lite.lock.json)，核验日期2026-10-27。采用MIT许可，Copyright (c) 2025 Jesse Vincent；[完整许可](licenses/superpowers-MIT.txt)。锁定不表示已安装插件，PADF不覆盖外部原Skill或要求全局安装。

| 上游方法 | PADF采用内容 | 适配边界 |
| --- | --- | --- |
| test-driven-development | 批准行为→真实预期RED→最小GREEN→必要重构/回归；独立具体expected | 不为历史代码补造RED，不要求逐微步commit/报告，等效策略按风险说明 |
| systematic-debugging | 复现事实、根因假设与验证、最小修复和回归 | Coder局部处理，复杂模块/系统问题才升级；不按修复次数自动加角色/审批 |
| verification-before-completion | 当前源码/适用测试/构建/回归/未测/CI的实际证据 | 不把每条微小陈述变成全套重跑；交付前完成必要检查，Coder不替独立QA/Review |

原始三Skill及TDD引用的`writing-good-tests.md`已核验。后者作为断言设计参考；其指向writing-skills不自动安装/采用。systematic-debugging中的root-cause-tracing/condition-based-waiting等为可选资料，不作为PADF额外依赖。未采用brainstorming/planning、Agent调度、其他Review/执行hooks；不引入自动删除历史实现、额外异常批准或第四次修复自动转交Owner等原工作流限制。

唯一操作语义维护在[工程标准](../standards/engineering/README.md#tdd调试与完成核验)，Coder/QA/Reviewer按原角色交接；本集成不增加新的Skill调用或审批阶段。本轮只读评估PKMS已有实践：其新增报告工具TDD有记录，产品开发的持续效果尚未证明；不据资料阅读宣称已有历史TDD或所有项目均已改善。
