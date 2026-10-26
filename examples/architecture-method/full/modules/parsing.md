# L2 Parsing：固定输入与发布

PROPOSED文档草案，system_approval_ref=null；[系统](../README.md)与[共同接口](../CONTRACTS.md)为约束。当前SYN-FULL-F02只深化解析领取、校验和发布；不穷举各格式解析器/AI或后续搜索。

Tasks在C-API拥有Task、lease_epoch与Publication；C-PARSER拥有临时候选bundle，绝不拥有Record/current或原始字节。任务输入固定record_id/source_revision/hash/parser_version/config_version；服务端权威时钟、每次重新领取增加epoch，过期旧结果不能覆盖新lease。

内部端口候选 `TaskService.claim(identity)->Lease|Idle`、`validateAndPublish(ctx,task_id,epoch,manifest)->Published|Rejected(reason)`；Parser经受限API取得获准固定字节，不直连DB/存储。隔离进程无任意网络/宿主写权限；格式错误/超限明确Failed，原件仍可读。具体限额/沙箱能力待验证。

提交先验身份/lease未过期和epoch、源current且ACTIVE、当前Policy、输入指纹和完整manifest/hash/schema；任何一项失败都不切publication。候选分块在STAGING不可见，完整校验后短事务切换generation指针和任务终态；旧完整代在仍获授权且同源条件下可显示并标旧时点，首次未就绪明确Pending，不能伪装空正文。source_revision与generation_id不同，重新解析不改原件身份。

Worker失联重新领取新epoch；旧Worker迟到Rejected，不能靠客户端时间胜出。提交响应丢失沿task/epoch/输入指纹查询稳定结果。系统恢复时递增恢复标记并废止旧lease，禁止故障前结果自动发布；具体备份/恢复实现待D2。图见[Runtime](../views/runtime.md)。

验收设计NOT RUN：当前合法结果发布；旧epoch/换源/tombstone/撤权/缺块/hash错均拒绝；切换前崩溃保留旧完整代，提交后丢响应不重复发布；解析超限不阻断原件读取。实现前需批准系统、Feature合同、持久状态Schema与资源/恢复测试，不声称这些已完成。
