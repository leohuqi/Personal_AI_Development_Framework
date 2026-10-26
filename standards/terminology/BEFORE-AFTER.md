# 语境决定是否修改

下面是少量真实短句与中性回归例。建议是本轮专家判断，未修改 PKMS 原文，未做用户理解测试。完整逐例的原句、建议、来源、保护项和期望处置以 [REGRESSION-CASES.json](REGRESSION-CASES.json) 为准；它是案例数据，不是自动替换字典，也不是第二份词表。

## 核对过的真实短句

均核对到PKMS main `f22286701db4f4946922972eb116ef893beef430` 的原始行；只引用安全通用短句，不复制周边项目规则。冻结Pilot仅作语言比较，不回写历史。

| 原句 | 建议或保留 | 来源与意义保持 |
| --- | --- | --- |
| 本轮只验证架构文档的分层与可消费性。 | 本轮只检查架构文档的分层是否清楚、是否便于各角色查阅并使用。 | [DESIGN.md:17](https://github.com/leohuqi/Personal-Knowledge-Library/blob/f22286701db4f4946922972eb116ef893beef430/docs/architecture/pilot-v0.1/modules/document-management/DESIGN.md#L17)。仍只验证文档；不声称产品测试或批准。 |
| Coder 的最短消费路径： | Coder 的最短阅读路径： | [DESIGN.md:148](https://github.com/leohuqi/Personal-Knowledge-Library/blob/f22286701db4f4946922972eb116ef893beef430/docs/architecture/pilot-v0.1/modules/document-management/DESIGN.md#L148)。只改阅读动作短语，原路径和实施前提保留。 |
| 这张图展示独立运行单元。 | 这张图展示应用和数据存储及其通信关系。 | [README.md:11](https://github.com/leohuqi/Personal-Knowledge-Library/blob/f22286701db4f4946922972eb116ef893beef430/docs/architecture/README.md#L11)。当前图为C4 Container，按[C4说明](https://c4model.com/abstractions/container)包含应用与存储；节点/连线不改。 |
| 若发现源/模型漂移、 | 若发现来源文档或模型版本与固定输入不一致、 | [模块README.md:125](https://github.com/leohuqi/Personal-Knowledge-Library/blob/f22286701db4f4946922972eb116ef893beef430/docs/architecture/modules/document-management/README.md#L125)。这是版本检查短语；原停止条件、权限与后续处理全部保留。 |
| 消费者保存 inbox 去重 | **保留** | [CONTRACT.md:53](https://github.com/leohuqi/Personal-Knowledge-Library/blob/f22286701db4f4946922972eb116ef893beef430/docs/architecture/modules/document-management/CONTRACT.md#L53)。真实消息语境，消费者用词准确，`inbox`及原事务约束不变。 |

## 合成正反例

这些是为回归特意编写的中性输入，不算真实仓库缺陷。概念错误的“after”是纠正方向，可能改变原错误命题，**不能当已获授权的等义润色自动写入**；需由负责角色核对原意和依据。

| 应保留或解释的正例 | 应识别的错误建议/混淆 |
| --- | --- |
| JavaScript闭包中的函数访问其词法环境。 | 因含“闭包”就删除；或把普通“规范齐全”叫“规范消费闭包”。 |
| ML监测具体说明输入分布、预测分布及性能相对基线变化。 | 将文档/模型文件版本不一致无条件称为ML模型漂移；或把所有漂移信号视为同一机制。 |
| C4 Container表示应用或数据存储。 | 所有Container都改成Docker容器，或同Container组件改成独立服务。 |
| Agent选择步骤并使用模型与工具；Skill提供按需指令。 | 一次模型调用就是完整Agent，读Skill就算工具已执行，Agent自动拥有写入权限。 |
| 开发Agent参与交付；产品Agent为最终用户执行产品任务。 | 两者词义及数据/操作权限自动继承。 |
| 先检索，再据检索信息生成可称RAG。 | 仅返回向量近邻列表就称完成RAG；Vector Search与Semantic Search完全同义。 |
| 知识片段的身份、粒度及生命周期按项目明确定义。 | 通用定义强制所有项目采用`fragment_id`和特定原件修订模型。 |
| Benchmark测量明确任务/数据，另按产品验收条件判断。 | 基准高分即整个产品已验收。 |

技术名称可在旁补中文，不改 `POST /api/items`、`source_version`、`KnowledgeFragment`、`PROPOSED`、Feature/ADR ID或SHA。不能把“项目词条接受、系统技术仍PROPOSED”润色成“系统已批准”，也不能省略删除权限、数据权威、失败保留输入或恢复顺序。

## 未发现与未验证

在案例数据列明的九个PKMS当前架构页面中，本轮精确搜索未发现“规范消费闭包”“源接缝”“来源漂移”。这不代表全仓没有，也不能把合成负例计入真实发现；真实存在的“源/模型漂移”已单独按版本语境处理。

本轮没有判断这些句子由AI还是人写成，没有理解率、速度或跨项目收益测量。机器可检查引用、保护文本和期望分支，真正意义保持仍需读完整语境并由负责角色/Reviewer判断。
