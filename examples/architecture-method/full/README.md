# 文件记录服务：长期 Architecture 入口

**SYNTHETIC / PROPOSED / DOCUMENTATION ONLY。** 示例基线SYN-FULL-B1；system_approval_ref=null。所有产品行为、接口、技术与ADR是练习候选；无真实Owner批准、产品实现或编码权限。Profile=Full；architecture_scope=both，先系统候选再有界模块草案，不能宣称正式Module Ready。

服务让已认证成员上传文件、读取自己的记录，并由隔离解析进程生成可重建的文本。API管理记录、权限、任务与发布，解析进程只提交候选结果；数据库保存权威元数据，受管对象存储保存不可变文件字节。多运行节点、不可信输入、权限变化和文件/目录跨资源恢复使Full有价值。没有离线副本、知识图谱、私人设备拓扑或自动业务决策。

| 问题 | 最短入口 | 继续下钻 |
| --- | --- | --- |
| 为什么选此结构、还有哪些决定？ | [L0 Overview](OVERVIEW.md) | [ADR-001](adr/ADR-001.md)、[质量风险](views/security-quality.md) |
| 系统对谁负责、哪些在边界外？ | [Context](views/structure.md#context) | [Container](views/structure.md#container) |
| 软件/存储与运行位置？ | [Container](views/structure.md#container) | [Deployment](views/deployment.md) |
| 上传、异步解析和拒绝如何运行？ | [Runtime](views/runtime.md) | [Records契约](modules/records.md)、[Parsing契约](modules/parsing.md) |
| 原件、元数据、派生结果谁拥有？ | [Data](views/data.md) | [公共合同](CONTRACTS.md) |
| 如何编写当前文件接管/恢复功能？ | [Records模块](modules/records.md) | 公共合同；核对真实批准Feature/基线后再实施 |
| 如何找到完整规则或处理未批决定？ | 本页及对应模块 | [Source Map](SOURCE-MAP.md)、[ADR-001](adr/ADR-001.md) |

Master读Overview/风险/待决；SA读受影响系统视图；MA读目标模块、公共契约及相关系统片段；Coder/QA读准确Feature任务、模块不变量/失败/验收，再核验真实批准。Reviewer先固定准确diff/源和需求再独立查相应模型/图。不要求任何读者先读整个JSON、审计或本例全部文件。

当前只深化Records和Parsing两个相关模块。未来检索、批量管理、身份接入不在本阶段；具体框架版本、持久Schema/OpenAPI、备份介质/保留与恢复阈值未定。所有验收是设计，产品NOT RUN。图预览/浏览器检查不能替代正式系统批准和业务测试。
