# 历史流程例外 PE-PQA-PR7-20261021

项目专属案例仅在此记录，不把PQA业务规则写进通用Skill。来源为Owner本次G-01说明及2026-10-21通过连接器读取的GitHub/Linear事实；不修改历史Git、PQA PR或Linear状态。

| 事实/来源 | 核验及界限 |
| --- | --- |
| Owner明确授权合并 | Owner本次G-01原始说明确认；原操作发生于另一会话，未伪造审批ID/签名 |
| PR精确范围 | [PQA PR7](https://github.com/leohuqi/Personal_Quant_Analyst/pull/7)，Base c5f424b957f58a894d401a870bddfc6cf2c037f8，Head 37565eb2d9379b8bff9ed048473b81fbf79cf7f3 |
| 合并前独立审查缺失 | [R4原记录](https://github.com/leohuqi/Personal_Quant_Analyst/pull/7#issuecomment-6308204263)明确同实施会话、NOT RUN、仅创建Dispatch未启动；本轮读取原生reviews列表为空（缺原生Review单独不能证明没有外部Handoff，需结合明确NOT RUN来源） |
| 代码/CI检查成功 | [精确Head CI](https://github.com/leohuqi/Personal_Quant_Analyst/actions/runs/39544942730)经connector核对completed/success；接入一致性/测试步骤详见原记录，本轮未重新执行PQA业务测试 |
| Master在缺Review时合并 | GitHub merged_at=2026-10-21T05:37:52Z，merge commit [2c249ddda6af0b70ee5963854be7f6653846712c](https://github.com/leohuqi/Personal_Quant_Analyst/commit/2c249ddda6af0b70ee5963854be7f6653846712c)；Owner请求不能解释为豁免 |
| Linear短暂Done | [LEO-157](https://linear.app/leohuqi/issue/LEO-157)的实时stateHistory：05:37:54.018Z In Review→Done，05:38:22.651Z Done→In Review，约29秒；当前In Review/completedAt=null |
| 事后补证的界限 | [事后R5记录](https://github.com/leohuqi/Personal_Quant_Analyst/pull/7#issuecomment-6309022623)同样明确非独立；未来真实事后Review可补质量证据，但不能声称合并前门禁已完成 |
| 自动映射归因 | 转换时序与合并高度相关，Owner说明称自动Done；具体触发配置/操作者未由本轮设置页验证，不把时序推断冒称平台配置证据 |

## 责任与改进

这是Master未主动执行关键门禁的流程例外，不归咎Owner未记住规则；技术/CI成功、Owner合并授权与缺失Review是独立事实。没有由此直接认定业务代码不安全或要求回滚。当前G-01不对PQA做代码、状态或生产操作，也不替PQA执行其尚缺的事后独立Review。

回归应构造OwnerMerge=GRANTED、CI=PASS、Review=NOT RUN的快照，预期BLOCKED；合并后的Done不能生成OWNER_ACCEPTED，缺验收Done须识别异常。新框架有单独真实独立审查，不能拿它代替PQA历史审查。平台设置权限/计划尚未验证，见[补偿手册](../../workflow/action-preflight.md)。
