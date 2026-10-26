# 公共接口与权限契约（本例唯一完整定义）

SYN-FULL-B1 / PROPOSED，所有路由/伪接口为合成候选，不是已实现API。模块只链接本页共同规则，接口字段限额和完整OpenAPI尚未定义。

## 身份与数据访问

API验证身份提供方签名/受众/有效期及当前Policy；具体provider、凭据轮换与退出机制待选。principal不得由请求body中的role代替。每个对象读写均服务端鉴权；不可读与不存在统一NotFound，不通过列表计数、摘要、任务或错误泄露存在。Parser为设备/工作负载身份，仅领取分配任务和固定修订，不能浏览全库。读取与发布前复验当前权限；新请求不能仅信任旧缓存许可。身份服务不可用时不接受未经验证的新会话；已验证会话的有效期/撤销机制未定，不承诺继续可写。

## 写入、版本与错误

写请求使用expected_revision及幂等key。幂等身份=principal+operation+key+payload fingerprint；同身份重试返回原稳定结果，同key异载荷Conflict。事务内CAS和当前授权复验后才提交变化及稳定结果；慢IO后再次核验权限/版本。取消/超时不代表未提交，先查询原operation，不自动换key覆盖。错误={code,request_id,retryable}，仅授权用户可见current_revision，不返回宿主路径/堆栈/正文。Accepted只受理，Committed才是持久终态。

## 提供与消费接口

| 接口/提供→消费 | 输入 | 结果/失败及权限 |
| --- | --- | --- |
| `beginImport` Records→Web | verified principal、name、size、hash、key | Accepted(operation_id)；需import权限，未经核验不公开记录 |
| `commitImport` Records→Web | operation_id、verified chunks | Committed(record_id,source_revision)或Pending/Invalid/Denied；同key不重建记录 |
| `describe/read` Records→Web | record_id、指定source_revision | 固定修订流/元数据或NotFound/Unavailable；每次鉴权，无任意宿主path |
| `tombstone/restore` Records→Web | record_id、expected_revision、key | 新row_revision或Conflict/Denied；不等于永久purge |
| `operationStatus` Records→Web | operation_id | 本人获准查看的持久阶段/稳定结果；不按HTTP超时猜测 |
| `claimTask` Tasks→Parser | verified workload identity | task_id、source_revision、input_hash、lease_epoch、到期；无任务则Idle |
| `submitResult` Tasks→Parser | task_id、epoch、input fingerprint、bundle hash/manifest | Published或Rejected(reason)；需未过期租约、源仍current/active、当前授权、完整schema/hash |

接口签名在对应模块细化，本页维护共同授权/错误含义。外部公开HTTP路径/状态码、大小/资源限额、租约时长和物理Schema为UNKNOWN；不能由Coder随意补入生产。
