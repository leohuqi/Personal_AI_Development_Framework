# <动作> Readiness：<准确目标/版本>

Owner评审入口/任务：；现有授权及明确范围：；当前Base/HEAD/目标/环境：。

| 门禁 | PASS / BLOCKED / NOT VERIFIED / N/A及理由 | 精确证据 |
| --- | --- | --- |
| 本操作Owner授权 | | |
| 当前Base/HEAD与目标规则 | | |
| 实现/CI/适用QA | | |
| 真实Fresh-Context Review与条件 | | |
| 开放发现/关键依赖 | | |
| 本动作额外前提（Design/Release/Recovery/Acceptance） | | |

总体：READY / BLOCKED / NEEDS_OWNER_DECISION。原因与下一步：。只请求真正缺少的Owner决定，既有有效范围内继续分派；Owner请求不被当作豁免。

附录引用而非重复正文：Task Contract、快照观测/有效期及摘要、执行前新快照复核、实际工具回执/原子HEAD匹配、事后8类证据/Linear核对、例外及补偿。实际未执行写NOT RUN，不预先声明结果。

## G-01 Owner验收清单

- [ ] 六动作前主动预检，Owner授权不能覆盖缺失强制Review/CI/QA/依赖。
- [ ] 真实独立上下文/Execution/Base/HEAD/diff/Handoff及条件证据，不用自审或Dispatch冒充。
- [ ] HEAD/批准/政策/发现变化使旧READY失效，调用前实时复核并使用条件HEAD操作。
- [ ] Merge/验收/Done/发布/生产证据分离，无验收Done可识别；平台限制/补偿如实交代。
- [ ] 适用历史例外原样记录，无伪造合并前Review或擅自回滚/状态更改。
- [ ] 原v0.3.2分派权限保持；本地与CI回归、真实独立Review证据可核对。
- [ ] 已知限制（非服务器强制拦截、映射未验证、非原子重读窗口）明确，后续配置/试验另有范围。

验收、合并、发布分别记录适用Owner决定；清单勾选本身不授予新权限。
