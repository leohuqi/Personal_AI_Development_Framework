# 按事实识别当前权威：可选的小型示范

本例本可不建Source Map；为演示三种状态而保留这张短表，不要求所有项目照建。迁移状态不授予批准；全部为PROPOSED合成来源。

| 事实 | 状态 | 唯一当前维护位置 | 来源处理 |
| --- | --- | --- | --- |
| 接管的ID/版本、阶段恢复与不丢唯一字节 | MIGRATED | [Records](modules/records.md) | 设计迭代旧摘要不再另存可编辑正文 |
| 公共授权/幂等/CAS/错误 | MIGRATED | [CONTRACTS](CONTRACTS.md) | 模块只链接不手工复制完整共同规则 |
| 稳定结构ID/方向/消息顺序、关系基数 | NORMATIVE_REUSE | [model.json](../model.json) 的对应view与relations | 本例单一模型，图只是呈现；实际项目跨版本时须固定SHA/章节 |
| PKMS参考方法/Review | HISTORICAL_ONLY | [sources](../../../standards/architecture/sources.md)标明固定输入 | 只证明方法来源，不作为本例业务/技术规范 |

此示范的NORMATIVE_REUSE是同一候选版本中的模型依赖；对真实跨版本旧规范复用必须给不可变SHA/准确段落。本例不把案例内的相对链接冒充已批准固定旧版本，也不虚构迁移审批。模型或正文冲突时停止受影响设计，不能挑更短一份实现。
