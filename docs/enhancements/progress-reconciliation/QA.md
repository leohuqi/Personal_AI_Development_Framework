# 独立 QA 结果

**复审后QA PASS：独立行为探针66/66通过，13条受影响框架回归命令全部成功。** 被测对象是返修后功能冻结的本地候选，准确实现、fixture及QA runner的SHA256见[新增复核结果](validation/qa-rereview-results.json)；发布为Git提交后须核对这些内容哈希，不能将本报告自动套用到变化后的实现。

[独立用例与可重复执行入口](../../../tests/v0.3/run-progress-qa-tests.mjs)按Owner验收需求验证准确子任务、W1/W2 Draft/W3附条件/W4真实返工、无父普通任务、父子与阻塞分离、下阶段依赖协调、已正确零写入、未知写结果重试、回读及Receipt持久化失败、并发/迟到事件、实际Team状态ID注入、旧合同及原G-01 Done边界。该入口只使用受控Mock，不连接真实Linear。

首轮独立执行47例有7例失败：[原始失败摘要及当时源哈希](validation/qa-first-failures.json)。发现当前Review拒绝/未完成条件/开放P1能被另一份旧G-01快照隐藏而写Done，以及Receipt未知事件、丢失条件、错误写入patch和阶段不符未被拒绝。Coder修复后，QA独立复跑通过，并补充异步时钟推进、授权执行中到期、旧执行伪返工、缺event携带旧Receipt等实际边界。首轮记录保留为本地未发布候选，不倒填Git SHA或当时未捕获的runner哈希。

[原55项结果](validation/qa-results.json)及[原13条回归](validation/qa-regressions.json)按原版本保留。Implementation Review随后在冻结的8d6e98c发现三处遗漏，QA已[独立复现并保留证据](validation/qa-review-findings-8d6.json)：当前未满足依赖仍可Done、READY/Todo Receipt可代替Handoff后协调、过期final readback被判成功。Coder返修后新增负例及正控均通过：Done合并当前依赖与实际blockedBy；预执行Receipt不能满足收件门禁；最终回读须满足本次尝试的新鲜度与先后约束。

[当前行为结果](validation/qa-rereview-results.json)保存一条实际执行的Mock链：Handoff→Master ACK→准确执行Issue更新→Issue回读→Receipt保存→Receipt回读；另含202前序收件后，以203自己的identity/授权解除有据启动阻塞、回读并保存独立Receipt的下一阶段样例。样例ID、URL、时钟和审批均为受控输入，不证明现实批准或PQA任务被更新。

[返修后回归记录](validation/qa-rereview-regressions.json)含13条真实命令、退出状态、脚本及stdout哈希：CACF、Design Gate、Orchestration、G-01 340项、产品/反馈/概念Mockup、Review完整性、原试点、新进度45项和Profile。结果验证现有门禁与受控框架行为；未新增真实产品、浏览器、数据库或跨进程原子性验证。

QA执行者为独立真实Agent `/root/progress_qa`，分派为Issue27的 `PROGRESS-QA-01`；未参与实现修复，未代Owner验收，也不代Independent Reviewer批准代码。当前没有未处理的QA阻断发现。真实PQA/PKMS/Linear零写入；当前LEO-202/203/204已In Review的外部事实不计为本次修复成果。
