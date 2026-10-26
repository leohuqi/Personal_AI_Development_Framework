# Master 进度协调修复

本轮修复“Agent实际完成、Master已ACK，但执行子任务仍显示未启动”的框架缺口。任务为[Enhancement #27](https://github.com/leohuqi/Personal_AI_Development_Framework/issues/27)，交付为[Draft PR #28](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/28)。实现与受控验证已完成；独立实现审查的准确版本、结论及Owner待决事项以PR当前记录为准。

## 阅读入口

- [模块设计与必要流程图](DESIGN.md)：身份、状态、依赖、失败恢复及兼容边界。
- [独立DESIGN复审](https://github.com/leohuqi/Personal_AI_Development_Framework/pull/28#issuecomment-6417140907)：准确设计`a26f5c7`，原2项P2已修复；此结论不代表实现通过。
- [统一契约与执行API](../../../contracts/progress-reconciliation.md)：精确身份、状态映射、工具适配、Receipt、失败和幂等规则；[实现](../../../lib/progress-reconciliation.mjs)使用现有工具的注入接口。
- [RED原始结果](validation/tdd-red.json)：准确提交`c711f6d`的37例中36例失败，包含两个旧编排入口漏检；[GREEN与针对性回归](validation/coder-results.json)的40例通过。
- [独立QA](validation/qa-results.json)：55例通过，含W1–W4、实际Team状态ID注入、失败与并发、时钟推进、旧合同、Done门禁，以及完整Mock收件/回读/持久化链和下游依赖链；[首轮真实失败](validation/qa-first-failures.json)保留原输入绑定，不倒写为通过。

## 事实与范围

根因有两部分：旧任务引用允许父CR代替实际执行Issue；Master收件和编排检查没有强制的Linear写入、回读及同步回执要求。本轮在现有Master职责中补齐这些检查，不新增角色或运行时服务。

PQA CR-002的失步事实由Owner指令提供，作为受控历史fixture。2026-10-26只读观察中，LEO-202、203、204已经In Review，LEO-207为In Progress；相关PR13/14/15仍为Draft。它们不是本次框架修复产生的真实项目变化。本轮没有修改PQA/PKMS业务、真实任务状态或采用版本。

当前Linear工具没有原子版本条件参数。实现采用前读、最小关系增删、后读和明确失败；仍存在读取与写入之间无法完全消除的竞态，不能宣称原子CAS或跨会话exactly-once。

本Enhancement仅使用GitHub Issue27，没有分配Linear执行Issue，因此显式记录tracker=none、execution_issue_id=N/A；不发明Linear ID。真实分派、Handoff、Master ACK、独立审查和后续验证记录统一留在PR28。

## 接入与兼容

修复审查通过后，接入项目再单独批准并固定采用提交。旧v1 Contract及持久化Handoff保留原文；启用新同步时通过附加记录准确绑定父CR、执行Issue和执行上下文。父级验收不能自动批准子任务Done。旧记录可读兼容不代表新增Linear阶段可省略同步回执。

本PR保持Draft，验收、合并、发布和项目升级分别决定。
